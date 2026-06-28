import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

export interface TcpSyncMessage {
  type: 'sync_request' | 'sync_response' | 'health_check' | 'health_ok';
  areaCode: string;
  payload?: any;
  timestamp: string;
}

@Injectable()
export class TcpSyncAdapter implements OnModuleInit {
  private readonly logger = new Logger(TcpSyncAdapter.name);
  private server: net.Server | null = null;
  private clients: Map<string, net.Socket> = new Map();

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const tcpPort = this.config.get<number>('SYNC_TCP_PORT', 5100);
    if (!this.config.get<boolean>('SYNC_TCP_ENABLED', false)) {
      this.logger.log('TCP sync adapter disabled (SYNC_TCP_ENABLED=false)');
      return;
    }
    this.startServer(tcpPort);
  }

  private startServer(port: number) {
    this.server = net.createServer((socket) => {
      const remoteKey = `${socket.remoteAddress}:${socket.remotePort}`;
      this.logger.log(`TCP client connected: ${remoteKey}`);
      this.clients.set(remoteKey, socket);

      let buffer = '';
      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        const messages = buffer.split('\n');
        buffer = messages.pop() || '';
        for (const msg of messages) {
          if (msg.trim()) this.handleMessage(remoteKey, msg);
        }
      });

      socket.on('close', () => {
        this.logger.log(`TCP client disconnected: ${remoteKey}`);
        this.clients.delete(remoteKey);
      });

      socket.on('error', (err) => {
        this.logger.error(`TCP client error ${remoteKey}: ${err.message}`);
        this.clients.delete(remoteKey);
      });

      // Send health check on connect
      this.send(socket, { type: 'health_check', areaCode: '', timestamp: new Date().toISOString() });
    });

    this.server.listen(port, () => {
      this.logger.log(`TCP sync adapter listening on port ${port}`);
    });

    this.server.on('error', (err) => {
      this.logger.error(`TCP server error: ${err.message}`);
    });
  }

  private handleMessage(remoteKey: string, raw: string) {
    try {
      const msg: TcpSyncMessage = JSON.parse(raw);
      this.logger.debug(`TCP message from ${remoteKey}: ${msg.type}`);

      switch (msg.type) {
        case 'health_ok':
          this.logger.log(`Health OK from ${remoteKey}`);
          break;
        case 'sync_response':
          this.logger.log(`Sync response from ${remoteKey}: ${JSON.stringify(msg.payload).substring(0, 100)}`);
          break;
        default:
          this.logger.warn(`Unknown TCP message type: ${msg.type}`);
      }
    } catch (e: any) {
      this.logger.warn(`Invalid TCP message from ${remoteKey}: ${raw.substring(0, 100)}`);
    }
  }

  /** Send a sync request to a remote TCP gateway */
  async sendSyncRequest(host: string, port: number, areaCode: string, payload: any): Promise<TcpSyncMessage | null> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(null);
      }, 30000);

      client.connect(port, host, () => {
        const msg: TcpSyncMessage = {
          type: 'sync_request',
          areaCode,
          payload,
          timestamp: new Date().toISOString(),
        };
        client.write(JSON.stringify(msg) + '\n');
      });

      let buffer = '';
      client.on('data', (chunk) => {
        buffer += chunk.toString();
        const idx = buffer.indexOf('\n');
        if (idx >= 0) {
          const raw = buffer.substring(0, idx);
          clearTimeout(timeout);
          client.destroy();
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(null);
          }
        }
      });

      client.on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    });
  }

  private send(socket: net.Socket, msg: TcpSyncMessage) {
    try {
      socket.write(JSON.stringify(msg) + '\n');
    } catch (e: any) {
      this.logger.error(`TCP send error: ${e.message}`);
    }
  }

  /** Graceful shutdown */
  async shutdown() {
    for (const [key, socket] of this.clients) {
      socket.end();
      this.clients.delete(key);
    }
    if (this.server) {
      await new Promise<void>((resolve) => this.server!.close(() => resolve()));
    }
  }
}

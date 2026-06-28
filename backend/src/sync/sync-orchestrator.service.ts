import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as http from 'http';
import * as https from 'https';
import * as sql from 'mssql';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SyncOrchestratorService {
  private readonly logger = new Logger(SyncOrchestratorService.name);

  // Map DB areaCode values (AREA-1, AREA-2) to sync keys (october, new_cairo)
  private readonly AREA_CODE_MAP: Record<string, string> = {
    'AREA-1': 'october', 'AREA-2': 'new_cairo', 'AREA-3': 'sodic_ednc',
    'AREA-4': 'sodic_estates', 'AREA-5': 'sodic_vye', 'AREA-6': 'badya_city',
    'AREA-7': 'north_coast', 'AREA-8': 'uvines_mall',
  };

  // Direct Symbiot SQL Server connections per area (READ ONLY — SELECT only)
  // All connections use sa account with minimal privileges (read-only by DB config)
  private readonly SYMBIOT_DB: Record<string, { server: string; database: string; user: string; password: string }> = {
    october:     { server: 'VM1', database: 'PalmHills_October', user: 'sa', password: 'H$gVFED$x+vSqQ3K' },
    new_cairo:   { server: 'VM1', database: 'PalmHills_NewCairo', user: 'sa', password: 'H$gVFED$x+vSqQ3K' },
    sodic_ednc:  { server: 'VM1', database: 'SODIC', user: 'sa', password: 'H$gVFED$x+vSqQ3K' },
    uvines_mall: { server: '10.50.30.4', database: 'ABRAJ_UVENUS', user: 'sa', password: 'H$gVFED$x+vSqQ3K' },
  };

  // sBill per area (fallback data source)
  private readonly SBILL_PER_AREA: Record<string, { url: string; user: string; pass: string }> = {
    october:     { url: 'http://10.50.30.2:9999', user: 'admin', pass: 'iskra' },
    new_cairo:   { url: 'http://10.50.30.2:9090', user: 'admin', pass: 'admin' },
    sodic_ednc:  { url: 'http://10.50.30.2:9191', user: 'admin', pass: 'admin' },
    uvenus_mall: { url: 'http://10.50.30.4:9191', user: 'admin', pass: 'admin' },
    badya:       { url: 'http://10.50.30.5:9090', user: 'admin', pass: 'iskra' },
    bo_island:   { url: 'http://10.50.30.5:9999', user: 'admin', pass: 'iskra' },
    estates:     { url: 'http://10.50.30.5:9000', user: 'admin', pass: 'iskra' },
    sodic_vye:   { url: 'http://10.50.30.5:9909', user: 'admin', pass: 'iskra' },
    chillout:    { url: 'http://10.50.30.5:9990', user: 'admin', pass: 'iskra' },
  };

  private toSyncKey(areaCode: string): string {
    return this.AREA_CODE_MAP[areaCode] || areaCode;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Connect to Symbiot SQL Server (READ ONLY - SELECT only)
  private async getSymbiotPool(areaCode: string): Promise<sql.ConnectionPool> {
    const syncKey = this.toSyncKey(areaCode);
    const cfg = this.SYMBIOT_DB[syncKey];
    if (!cfg) throw new Error(`No Symbiot database config for area: ${areaCode}`);
    return new sql.ConnectionPool({
      server: cfg.server, database: cfg.database,
      user: cfg.user, password: cfg.password,
      options: { encrypt: false, trustServerCertificate: true, connectTimeout: 15000, requestTimeout: 120000 },
    }).connect();
  }

  private httpGet(url: string, headers: Record<string, string> = {}, timeout = 30000): Promise<any> {
    return new Promise((resolve, reject) => {
      const opts: any = { timeout, headers };
      const req = http.get(url, opts, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Invalid JSON response')); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    });
  }

  // Authenticate to per-area sBill/billing system and get JWT token
  private async sbillAuth(areaCode: string): Promise<{ token: string; url: string }> {
    const syncKey = this.toSyncKey(areaCode);
    const cfg = this.SBILL_PER_AREA[syncKey] || this.SBILL_PER_AREA['october'];
    const body = JSON.stringify({ username: cfg.user, password: cfg.pass, rememberMe: true, projectId: '1' });
    const token = await new Promise<string>((resolve, reject) => {
      const req = http.request(`${cfg.url}/api/authenticate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        timeout: 15000,
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data).id_token); }
          catch { reject(new Error(`Auth failed for ${areaCode}`)); }
        });
      });
      req.on('error', reject);
      req.write(body); req.end();
    });
    return { token, url: cfg.url };
  }

  // Primary sync: Direct from Symbiot SQL Server (READ ONLY)
  // Fallback: sBill REST API
  async syncMeterMaster(areaCode: string): Promise<{ synced: number; errors: string[]; total: number }> {
    const errors: string[] = [];
    let synced = 0;
    let total = 0;
    const batch: any[] = [];

    try {
      // 1. Try direct Symbiot SQL first
      const pool = await this.getSymbiotPool(areaCode);
      // Find project for this area — MUST be linked via areaId (no cross-area fallback)
      const areaRec = await this.prisma.coreArea.findFirst({ where: { areaCode } });
      if (!areaRec) return { synced: 0, errors: ['Area not found: ' + areaCode], total: 0 };
      const project = await this.prisma.coreProject.findFirst({ where: { areaId: areaRec.id, isActive: true } });
      if (!project) return { synced: 0, errors: ['No active project for area: ' + areaCode + ' — create project first'], total: 0 };
      const existingSerials = new Set((await this.prisma.meter.findMany({ select: { serialNumber: true } })).map(m => m.serialNumber));

      // Query devices with their EAV attributes flattened
      const devices = await pool.request().query(`
        SELECT d.PkID, d.Name, d.SerialNo, d.DeviceID, d.DeviceType, d.LocationFk, d.IsActive,
               da4.AttrVal as MeterSerial, da62.AttrVal as DeviceID_Attr,
               da105.AttrVal as ContactorStatus, da120.AttrVal as SyncStatus,
               da109.AttrVal as WaterConsumption, da110.AttrVal as WaterSerial,
               da117.AttrVal as BillingConsumption
        FROM Device d
        LEFT JOIN DeviceAttr da4 ON da4.DeviceFk = d.PkID AND da4.AttrKeyFk = 4
        LEFT JOIN DeviceAttr da62 ON da62.DeviceFk = d.PkID AND da62.AttrKeyFk = 62
        LEFT JOIN DeviceAttr da105 ON da105.DeviceFk = d.PkID AND da105.AttrKeyFk = 105
        LEFT JOIN DeviceAttr da120 ON da120.DeviceFk = d.PkID AND da120.AttrKeyFk = 120
        LEFT JOIN DeviceAttr da109 ON da109.DeviceFk = d.PkID AND da109.AttrKeyFk = 109
        LEFT JOIN DeviceAttr da110 ON da110.DeviceFk = d.PkID AND da110.AttrKeyFk = 110
        LEFT JOIN DeviceAttr da117 ON da117.DeviceFk = d.PkID AND da117.AttrKeyFk = 117
        WHERE d.IsActive IS NULL OR d.IsActive = 1 OR d.IsActive = 0
      `);
      
      total = devices.recordset.length;
      for (const dev of devices.recordset) {
        const serial = dev.SerialNo || dev.MeterSerial || `SYM-${dev.PkID}`;
        if (existingSerials.has(serial)) continue;
        existingSerials.add(serial);
        
        const now = new Date();
        batch.push({
          id: uuid(), serialNumber: serial,
          meterType: 'electricity' as any,
          brand: dev.Name || 'Symbiot',
          model: dev.DeviceID || '',
          status: 'available' as any,
          projectId: project.id,
          activationDate: now,
          installationDate: now,
          relayStatus: dev.ContactorStatus || null,
          createdBy: 'sync', updatedBy: 'sync',
        });
      }
      await pool.close();

      if (batch.length > 0) {
        for (let i = 0; i < batch.length; i += 100) {
          await this.prisma.meter.createMany({ data: batch.slice(i, i + 100), skipDuplicates: true });
        }
        synced = batch.length;
      }
    } catch (e: any) {
      errors.push(`Symbiot SQL error: ${e.message}`);
      // Fallback: try sBill API
      try {
        const fbResult = await this.syncMeterMasterFallback(areaCode);
        return fbResult;
      } catch (fbErr: any) {
        errors.push(`Fallback also failed: ${fbErr.message}`);
      }
    }

    return { synced, errors, total };
  }

  // Fallback sync via sBill REST API
  private async syncMeterMasterFallback(areaCode: string): Promise<{ synced: number; errors: string[]; total: number }> {
    const errors: string[] = []; let synced = 0; let total = 0; const batch: any[] = [];
    const { token, url } = await this.sbillAuth(areaCode);
    const authHeader = { Authorization: `Bearer ${token}` };
    const areaRec = await this.prisma.coreArea.findFirst({ where: { areaCode } });
    const project = areaRec 
      ? await this.prisma.coreProject.findFirst({ where: { areaId: areaRec.id, isActive: true } })
      : await this.prisma.coreProject.findFirst({ where: { isActive: true } });
    if (!project) return { synced: 0, errors: ['No active project for area: ' + areaCode], total: 0 };
    const existingSerials = new Set((await this.prisma.meter.findMany({ select: { serialNumber: true } })).map(m => m.serialNumber));

    for (let page = 0; page < 100; page++) {
      const data = await this.httpGet(`${url}/api/meters?page=${page}&size=100`, authHeader);
      if (!Array.isArray(data) || data.length === 0) break;
      total += data.length;
      for (const item of data) {
        const meter = item.meter || item;
        const serial = meter.serial || meter.number;
        if (!serial || existingSerials.has(serial)) continue;
        existingSerials.add(serial);
        const now = new Date();
        batch.push({
          id: uuid(), serialNumber: serial,
          meterType: (meter.type === 'Water' ? 'water_main' : 'electricity') as any,
          brand: meter.name || 'sBill', model: meter.model || '',
          status: 'available' as any, projectId: project.id,
          activationDate: meter.activationDate ? new Date(meter.activationDate) : now,
          installationDate: meter.activationDate ? new Date(meter.activationDate) : now,
          initialBalance: meter.initialBalance ? parseFloat(meter.initialBalance) / 100 : 0,
          relayStatus: meter.relayStatus || null,
          lastReadingDate: meter.lastFetchedReadingDate ? new Date(meter.lastFetchedReadingDate) : null,
          createdBy: 'sync', updatedBy: 'sync',
        });
      }
      if (data.length < 100) break;
    }
    if (batch.length > 0) {
      for (let i = 0; i < batch.length; i += 100) {
        await this.prisma.meter.createMany({ data: batch.slice(i, i + 100), skipDuplicates: true });
      }
      synced = batch.length;
    }
    return { synced, errors, total };
  }

  private flattenAttributes(attrs: any[]): Record<string, string> {
    const result: Record<string, string> = {};
    for (const attr of attrs || []) {
      result[attr.AttrName] = attr.AttrVal;
    }
    return result;
  }

  private mapMeterType(type: string): string {
    const map: Record<string, string> = {
      'Electric': 'electricity',
      'Electricity': 'electricity',
      'Water': 'water',
      'Solar': 'solar',
      'Gas': 'gas',
    };
    return map[type] || 'electricity';
  }

  private mapStatus(status: string): string {
    // Synced meters are ALWAYS 'available' (NEW) — never active
    // Active requires: unit + tariff + installation date + customer assigned
    return 'available';
  }

  // Check if meter can be activated (all 4 conditions met)
  async canActivateMeter(meterId: string): Promise<{ activatable: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    const meter = await this.prisma.meter.findUnique({ where: { id: meterId } });
    if (!meter) return { activatable: false, reasons: ['Meter not found'] };

    const assignment = await this.prisma.meterAssignment.findFirst({ where: { meterId, status: 'active' } });
    if (!assignment) reasons.push('No unit assigned');
    if (!meter.installationDate) reasons.push('No installation date');
    // Check customer assignment
    const customerAssigned = assignment?.customerId;
    if (!customerAssigned) reasons.push('No customer assigned');
    // Check tariff assignment
    const tariff = await this.prisma.tariffPlan.findFirst({ where: { projectId: meter.projectId, status: 'active' } });
    if (!tariff) reasons.push('No tariff assigned');

    return { activatable: reasons.length === 0, reasons };
  }

  async syncAllAreas(): Promise<Record<string, { synced: number; errors: string[] }>> {
    const results: Record<string, { synced: number; errors: string[] }> = {};
    for (const areaCode of Object.keys(this.SYMBIOT_DB)) {
      const r = await this.syncMeterMaster(areaCode);
      results[areaCode] = { synced: r.synced, errors: r.errors };
    }
    return results;
  }
}

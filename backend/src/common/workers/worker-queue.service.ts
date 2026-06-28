import { Injectable, Logger } from '@nestjs/common';

export interface WorkItem<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface WorkResult {
  itemId: string;
  success: boolean;
  error?: string;
  completedAt: Date;
}

type WorkHandler = (item: WorkItem) => Promise<boolean>;

@Injectable()
export class WorkerQueueService {
  private readonly logger = new Logger(WorkerQueueService.name);
  private queue: WorkItem[] = [];
  private processing = false;
  private handlers = new Map<string, WorkHandler>();
  private results: WorkResult[] = [];
  private maxConcurrent = 3;

  /** Register a handler for a work type */
  registerHandler(type: string, handler: WorkHandler) {
    this.handlers.set(type, handler);
  }

  /** Enqueue a work item */
  enqueue(item: Omit<WorkItem, 'createdAt' | 'attempts'>) {
    this.queue.push({ ...item, createdAt: new Date(), attempts: 0 });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processNext();
  }

  /** Enqueue multiple items */
  enqueueBatch(items: Omit<WorkItem, 'createdAt' | 'attempts'>[]) {
    for (const item of items) {
      this.queue.push({ ...item, createdAt: new Date(), attempts: 0 });
    }
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processNext();
  }

  private async processNext() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      const handler = this.handlers.get(item.type);

      if (!handler) {
        this.logger.warn(`No handler for work type: ${item.type}`);
        this.results.push({ itemId: item.id, success: false, error: `No handler for type: ${item.type}`, completedAt: new Date() });
        continue;
      }

      try {
        item.attempts++;
        const success = await handler(item);
        this.results.push({ itemId: item.id, success, completedAt: new Date() });

        if (!success && item.attempts < item.maxAttempts) {
          this.logger.warn(`Retrying work ${item.id} (attempt ${item.attempts}/${item.maxAttempts})`);
          this.queue.push({ ...item, createdAt: new Date() });
          this.queue.sort((a, b) => b.priority - a.priority);
        }
      } catch (e: any) {
        this.logger.error(`Work ${item.id} failed: ${e.message}`);
        this.results.push({ itemId: item.id, success: false, error: e.message, completedAt: new Date() });

        if (item.attempts < item.maxAttempts) {
          this.queue.push({ ...item, createdAt: new Date() });
          this.queue.sort((a, b) => b.priority - a.priority);
        }
      }
    }

    this.processing = false;
  }

  /** Get all results since last check */
  drainResults(): WorkResult[] {
    const r = [...this.results];
    this.results = [];
    return r;
  }

  /** Current queue depth */
  get depth(): number {
    return this.queue.length;
  }

  /** Whether worker is actively processing */
  get isProcessing(): boolean {
    return this.processing;
  }
}

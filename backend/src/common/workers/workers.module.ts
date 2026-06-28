import { Global, Module } from '@nestjs/common';
import { WorkerQueueService } from './worker-queue.service';

@Global()
@Module({
  providers: [WorkerQueueService],
  exports: [WorkerQueueService],
})
export class WorkersModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { SyncController } from './sync.controller';
import { SyncOrchestratorService } from './sync-orchestrator.service';
import { TcpSyncAdapter } from './tcp-sync-adapter';

@Module({
  imports: [DatabaseModule],
  controllers: [SyncController],
  providers: [SyncOrchestratorService, TcpSyncAdapter],
  exports: [SyncOrchestratorService, TcpSyncAdapter],
})
export class SyncModule {}

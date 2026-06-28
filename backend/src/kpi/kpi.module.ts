import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';

@Module({
  imports: [DatabaseModule],
  controllers: [KpiController],
  providers: [KpiService],
})
export class KpiModule {}

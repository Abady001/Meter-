import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { BillingModule } from '../billing/billing.module';
import { AuthModule } from '../auth/auth.module';
import { BillCycleController } from './bill-cycle.controller';

@Module({
  imports: [DatabaseModule, BillingModule, AuthModule],
  controllers: [BillCycleController],
})
export class BillCycleModule {}

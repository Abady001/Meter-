import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { CollectionsController } from './collections.controller';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [DatabaseModule, PaymentsModule, AuthModule],
  controllers: [CollectionsController],
})
export class CollectionsModule {}

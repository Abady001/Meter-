import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { ReadingValidationService } from './reading-validation.service';
import { AuthModule } from '../auth/auth.module';
import { ThresholdsModule } from '../projects/thresholds/thresholds.module';
import { PrismaService } from '../common/database/prisma.service';
import { PollingModule } from './polling/polling.module';
import { WaterBalanceModule } from './water-balance/water-balance.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, ThresholdsModule, PollingModule, WaterBalanceModule, NotificationsModule],
  controllers: [ReadingsController],
  providers: [ReadingsService, PrismaService, ReadingValidationService],
  exports: [WaterBalanceModule]
})
export class ReadingsModule {}

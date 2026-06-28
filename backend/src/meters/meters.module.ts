import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MetersController } from './meters.controller';
import { MetersService } from './meters.service';
import { MeterStateService } from './meter-state.service';

@Module({
  imports: [DatabaseModule, AuthModule, NotificationsModule],
  controllers: [MetersController],
  providers: [MetersService, MeterStateService],
  exports: [MetersService]
})
export class MetersModule {}

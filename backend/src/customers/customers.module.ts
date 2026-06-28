import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer360Service } from './customer-360.service';

@Module({
  imports: [DatabaseModule, NotificationsModule, AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, Customer360Service],
  exports: [CustomersService, Customer360Service]
})
export class CustomersModule {}

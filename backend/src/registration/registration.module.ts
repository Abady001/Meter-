import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { RegistrationController } from './registration.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [RegistrationController],
})
export class RegistrationModule {}

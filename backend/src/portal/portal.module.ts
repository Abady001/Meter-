import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { PortalController } from './portal.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PortalController],
})
export class PortalModule {}

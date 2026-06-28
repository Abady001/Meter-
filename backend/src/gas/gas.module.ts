import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { GasController } from './gas.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [GasController],
})
export class GasModule {}

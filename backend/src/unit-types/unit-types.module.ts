import { Module } from '@nestjs/common';
import { UnitTypesController } from './unit-types.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [UnitTypesController],
  providers: [PrismaService],
})
export class UnitTypesModule {}

import { Module } from '@nestjs/common';
import { ChilledWaterController } from './chilled-water.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [ChilledWaterController],
  providers: [PrismaService],
})
export class ChilledWaterModule {}

import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [SettlementController],
  providers: [PrismaService],
})
export class SettlementModule {}

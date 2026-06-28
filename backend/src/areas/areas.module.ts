import { Module } from '@nestjs/common';
import { AreasController } from './areas.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [AreasController],
  providers: [PrismaService],
})
export class AreasModule {}

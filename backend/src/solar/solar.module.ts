import { Module } from '@nestjs/common';
import { SolarController } from './solar.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [SolarController],
  providers: [PrismaService],
})
export class SolarModule {}

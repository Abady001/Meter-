import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { PrismaService } from '../common/database/prisma.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}

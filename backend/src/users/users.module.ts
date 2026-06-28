import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '../common/database/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [PrismaService],
})
export class UsersModule {}

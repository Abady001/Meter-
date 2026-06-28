import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({ imports: [DatabaseModule], controllers: [TicketsController], providers: [TicketsService], exports: [TicketsService] })
export class TicketsModule {}

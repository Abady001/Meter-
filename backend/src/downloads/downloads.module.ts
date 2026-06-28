import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}

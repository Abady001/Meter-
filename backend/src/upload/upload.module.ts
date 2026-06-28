import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DatabaseModule } from '../common/database/database.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ImportService } from './import.service';

@Module({
  imports: [DatabaseModule, MulterModule.register({ dest: './uploads' })],
  controllers: [UploadController],
  providers: [UploadService, ImportService],
  exports: [UploadService, ImportService],
})
export class UploadModule {}

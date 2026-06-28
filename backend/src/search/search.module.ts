import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { AuthModule } from '../auth/auth.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({ imports: [DatabaseModule, AuthModule], controllers: [SearchController], providers: [SearchService], exports: [SearchService] })
export class SearchModule {}

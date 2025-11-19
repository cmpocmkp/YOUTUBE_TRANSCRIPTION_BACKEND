import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { AppConfigModule } from '../common/config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}



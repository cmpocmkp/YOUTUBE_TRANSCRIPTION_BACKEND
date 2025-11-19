import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CronController } from './cron.controller';
import { CronRun, CronRunSchema } from './schemas/cron-run.schema';
import { YouTubersModule } from '../youtubers/youtubers.module';
import { VideosModule } from '../videos/videos.module';
import { YoutubeModule } from '../youtube/youtube.module';
import { TranscriptionModule } from '../transcription/transcription.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { AppConfigModule } from '../common/config/config.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: CronRun.name, schema: CronRunSchema }]),
    YouTubersModule,
    VideosModule,
    YoutubeModule,
    TranscriptionModule,
    AnalysisModule,
    AppConfigModule,
  ],
  controllers: [CronController],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}



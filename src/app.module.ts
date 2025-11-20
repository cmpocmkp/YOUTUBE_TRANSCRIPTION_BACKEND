import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigModule } from './common/config/config.module';
import { AppConfigService } from './common/config/config.service';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { YouTubersModule } from './youtubers/youtubers.module';
import { VideosModule } from './videos/videos.module';
import { YoutubeModule } from './youtube/youtube.module';
import { TranscriptionModule } from './transcription/transcription.module';
import { AnalysisModule } from './analysis/analysis.module';
import { CronModule } from './cron/cron.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.mongodbUri,
      }),
      inject: [AppConfigService],
    }),
    YouTubersModule,
    VideosModule,
    YoutubeModule,
    TranscriptionModule,
    AnalysisModule,
    CronModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}


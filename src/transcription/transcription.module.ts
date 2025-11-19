import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { AppConfigModule } from '../common/config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [TranscriptionService],
  exports: [TranscriptionService],
})
export class TranscriptionModule {}



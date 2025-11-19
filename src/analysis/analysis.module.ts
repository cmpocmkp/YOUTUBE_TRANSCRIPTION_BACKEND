import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AppConfigModule } from '../common/config/config.module';

@Module({
  imports: [AppConfigModule],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}



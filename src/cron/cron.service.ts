import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { CronRun, CronRunDocument, CronRunStatus } from './schemas/cron-run.schema';
import { AppConfigService } from '../common/config/config.service';
import { YouTubersService } from '../youtubers/youtubers.service';
import { VideosService } from '../videos/videos.service';
import { YoutubeService } from '../youtube/youtube.service';
import { TranscriptionService } from '../transcription/transcription.service';
import { AnalysisService } from '../analysis/analysis.service';
import { TranscriptStatus, VideoDocument } from '../videos/schemas/video.schema';
import { FileUtil } from '../common/utils/file.util';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private readonly JOB_TYPE = 'daily_transcription';

  constructor(
    @InjectModel(CronRun.name) private cronRunModel: Model<CronRunDocument>,
    private configService: AppConfigService,
    private youTubersService: YouTubersService,
    private videosService: VideosService,
    private youtubeService: YoutubeService,
    private transcriptionService: TranscriptionService,
    private analysisService: AnalysisService,
  ) {}

  // Cron schedule is set via decorator, but we use config for flexibility
  // Default: daily at 3 AM. Can be overridden via CRON_SCHEDULE env var
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyTranscription() {
    this.logger.log('Daily transcription job triggered');
    await this.runDailyTranscription();
  }

  async runDailyTranscription(): Promise<CronRun> {
    const cronRun = new this.cronRunModel({
      jobType: this.JOB_TYPE,
      startedAt: new Date(),
      status: CronRunStatus.RUNNING,
      videosProcessed: 0,
    });
    await cronRun.save();

    try {
      this.logger.log('Starting daily transcription job');

      // Fetch all active YouTubers
      const youTubers = await this.youTubersService.findActive();
      this.logger.log(`Found ${youTubers.length} active YouTubers`);

      let videosProcessed = 0;

      // Process each YouTuber
      for (const youTuber of youTubers) {
        try {
          const count = await this.processYouTuber(youTuber.channelId, cronRun._id.toString());
          videosProcessed += count;
        } catch (error) {
          this.logger.error(
            `Error processing YouTuber ${youTuber.channelId}:`,
            error,
          );
          // Continue with next YouTuber
        }
      }

      // Update cron run as successful
      cronRun.status = CronRunStatus.SUCCESS;
      cronRun.finishedAt = new Date();
      cronRun.videosProcessed = videosProcessed;
      cronRun.meta = {
        youTubersProcessed: youTubers.length,
      };
      await cronRun.save();

      this.logger.log(`Daily transcription job completed successfully. Videos processed: ${videosProcessed}`);
      return cronRun;
    } catch (error) {
      this.logger.error('Daily transcription job failed:', error);
      cronRun.status = CronRunStatus.FAILED;
      cronRun.finishedAt = new Date();
      cronRun.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await cronRun.save();
      throw error;
    }
  }

  private async processYouTuber(channelId: string, cronRunId: string): Promise<number> {
    this.logger.log(`Processing YouTuber: ${channelId}`);

    // Fetch recent videos (last 1 day)
    const youtubeVideos = await this.youtubeService.fetchRecentVideos(channelId, 1);
    this.logger.log(`Found ${youtubeVideos.length} recent videos for channel ${channelId}`);

    let processedCount = 0;
    for (const youtubeVideo of youtubeVideos) {
      try {
        const processed = await this.processVideo(youtubeVideo, channelId);
        if (processed) {
          processedCount++;
        }
      } catch (error) {
        this.logger.error(
          `Error processing video ${youtubeVideo.id}:`,
          error,
        );
        // Continue with next video
      }
    }
    return processedCount;
  }

  private async processVideo(
    youtubeVideo: { id: string; title: string; description: string; publishedAt: string },
    channelId: string,
  ): Promise<boolean> {
    this.logger.log(`Processing video: ${youtubeVideo.id} - ${youtubeVideo.title}`);

    // Check if video already exists
    let video = await this.videosService.findByYoutubeVideoId(youtubeVideo.id);

    if (!video) {
      // Create new video record
      video = await this.videosService.create({
        youtubeVideoId: youtubeVideo.id,
        channelId,
        title: youtubeVideo.title,
        description: youtubeVideo.description,
        publishedAt: new Date(youtubeVideo.publishedAt),
        transcriptStatus: TranscriptStatus.NOT_STARTED,
      });
      this.logger.log(`Created new video record: ${(video as VideoDocument)._id}`);
    } else {
      // Skip if already completed (unless we want to force re-run)
      if (video.transcriptStatus === TranscriptStatus.COMPLETED) {
        this.logger.log(`Video ${youtubeVideo.id} already transcribed, skipping`);
        return false;
      }
    }

    // Process transcription if needed
    if (video.transcriptStatus !== TranscriptStatus.COMPLETED) {
      const videoId = (video as VideoDocument)._id.toString();
      await this.transcribeAndAnalyzeVideo(videoId, youtubeVideo);
      return true;
    }

    return false;
  }

  private async transcribeAndAnalyzeVideo(
    videoId: string,
    youtubeVideo: { id: string; title: string; description: string },
  ): Promise<void> {
    let audioPath: string | null = null;
    let mp3Path: string | null = null;

    try {
      // Update status to in_progress
      await this.videosService.updateTranscriptStatus(videoId, TranscriptStatus.IN_PROGRESS);

      // Download audio
      this.logger.log(`Downloading audio for video ${youtubeVideo.id}`);
      audioPath = await this.youtubeService.downloadVideoAudio(youtubeVideo.id);

      // Convert to MP3 if needed
      mp3Path = FileUtil.getTempFilePath('mp3');
      if (!mp3Path) {
        throw new Error('Failed to generate temp file path');
      }
      await this.youtubeService.convertToMp3(audioPath, mp3Path);

      // Transcribe
      this.logger.log(`Transcribing audio for video ${youtubeVideo.id}`);
      const transcript = await this.transcriptionService.transcribeAudio(mp3Path);

      // Update video with transcript
      await this.videosService.updateTranscript(videoId, transcript, TranscriptStatus.COMPLETED);

      // Analyze transcript
      this.logger.log(`Analyzing transcript for video ${youtubeVideo.id}`);
      const { isKPRelated, analysis } = await this.analysisService.analyzeTranscript(
        transcript,
        {
          title: youtubeVideo.title,
          channelName: '', // Will be populated if needed
          publishedAt: new Date(),
        },
      );

      // Update video with analysis
      await this.videosService.updateAnalysis(videoId, isKPRelated, analysis);

      this.logger.log(`Successfully processed video ${youtubeVideo.id}`);
    } catch (error) {
      this.logger.error(`Error processing video ${youtubeVideo.id}:`, error);
      await this.videosService.updateTranscriptStatus(videoId, TranscriptStatus.FAILED);
      throw error;
    } finally {
      // Cleanup temporary files
      if (audioPath) {
        await this.youtubeService.cleanupFile(audioPath);
      }
      if (mp3Path) {
        await this.youtubeService.cleanupFile(mp3Path);
      }
    }
  }

  async findAll(query: {
    status?: CronRunStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: CronRun[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (query.startDate) {
        dateFilter.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        dateFilter.$lte = new Date(query.endDate);
      }
      filter.startedAt = dateFilter;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.cronRunModel
        .find(filter)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.cronRunModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<CronRun> {
    const cronRun = await this.cronRunModel.findById(id).exec();
    if (!cronRun) {
      throw new Error(`CronRun with ID ${id} not found`);
    }
    return cronRun;
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument, TranscriptStatus, VideoAnalysis } from './schemas/video.schema';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<VideoDocument>,
  ) {}

  async create(videoData: Partial<Video>): Promise<VideoDocument> {
    const video = new this.videoModel(videoData);
    return video.save();
  }

  async findByYoutubeVideoId(youtubeVideoId: string): Promise<VideoDocument | null> {
    return this.videoModel.findOne({ youtubeVideoId }).exec();
  }

  async findByChannelId(channelId: string): Promise<VideoDocument[]> {
    return this.videoModel.find({ channelId }).sort({ publishedAt: -1 }).exec();
  }

  async findOne(id: string): Promise<VideoDocument> {
    const video = await this.videoModel.findById(id).exec();
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }

  async findNeedingTranscription(): Promise<VideoDocument[]> {
    return this.videoModel
      .find({
        transcriptStatus: { $in: [TranscriptStatus.NOT_STARTED, TranscriptStatus.FAILED] },
      })
      .exec();
  }

  async updateTranscript(
    videoId: string,
    transcript: string,
    status: TranscriptStatus = TranscriptStatus.COMPLETED,
  ): Promise<VideoDocument | null> {
    return this.videoModel
      .findByIdAndUpdate(
        videoId,
        {
          transcript,
          transcriptStatus: status,
          lastTranscribedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async updateAnalysis(
    videoId: string,
    isKPRelated: boolean,
    analysis: VideoAnalysis,
  ): Promise<VideoDocument | null> {
    return this.videoModel
      .findByIdAndUpdate(
        videoId,
        {
          isKPRelated,
          analysis,
        },
        { new: true },
      )
      .exec();
  }

  async updateTranscriptStatus(
    videoId: string,
    status: TranscriptStatus,
  ): Promise<VideoDocument | null> {
    return this.videoModel
      .findByIdAndUpdate(videoId, { transcriptStatus: status }, { new: true })
      .exec();
  }

  async resetForReanalysis(videoId: string): Promise<VideoDocument | null> {
    return this.videoModel
      .findByIdAndUpdate(
        videoId,
        {
          transcriptStatus: TranscriptStatus.NOT_STARTED,
          transcript: '',
          analysis: undefined,
          isKPRelated: false,
        },
        { new: true },
      )
      .exec();
  }
}



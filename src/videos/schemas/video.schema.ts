import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

export enum TranscriptStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  MIXED = 'mixed',
  NOT_MENTIONED = 'not_mentioned',
}

@Schema({ _id: false })
export class SentimentAnalysis {
  @Prop({ required: true, enum: SentimentLabel })
  sentimentLabel: SentimentLabel;

  @Prop({ required: true, min: 0, max: 1 })
  confidence: number;

  @Prop({ required: true })
  explanation: string;
}

@Schema({ _id: false })
export class VideoAnalysis {
  @Prop({ type: SentimentAnalysis, required: false })
  cmKp?: SentimentAnalysis;

  @Prop({ type: SentimentAnalysis, required: false })
  kpGovernment?: SentimentAnalysis;

  @Prop({ type: SentimentAnalysis, required: false })
  imranKhan?: SentimentAnalysis;
}

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true, unique: true, index: true })
  youtubeVideoId: string;

  @Prop({ required: true, index: true })
  channelId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, type: Date })
  publishedAt: Date;

  @Prop({ default: '' })
  transcript: string;

  @Prop({
    type: String,
    enum: TranscriptStatus,
    default: TranscriptStatus.NOT_STARTED,
    index: true,
  })
  transcriptStatus: TranscriptStatus;

  @Prop({ type: Date, required: false })
  lastTranscribedAt?: Date;

  @Prop({ default: false, index: true })
  isKPRelated: boolean;

  @Prop({ type: VideoAnalysis, required: false })
  analysis?: VideoAnalysis;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
export const SentimentAnalysisSchema = SchemaFactory.createForClass(SentimentAnalysis);
export const VideoAnalysisSchema = SchemaFactory.createForClass(VideoAnalysis);



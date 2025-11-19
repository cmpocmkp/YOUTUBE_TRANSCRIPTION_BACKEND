import { TranscriptStatus, SentimentLabel } from '../schemas/video.schema';

export class SentimentAnalysisDto {
  sentimentLabel: SentimentLabel;
  confidence: number;
  explanation: string;
}

export class VideoAnalysisDto {
  cmKp?: SentimentAnalysisDto;
  kpGovernment?: SentimentAnalysisDto;
  imranKhan?: SentimentAnalysisDto;
}

export class VideoResponseDto {
  _id: string;
  youtubeVideoId: string;
  channelId: string;
  title: string;
  description: string;
  publishedAt: Date;
  transcript: string;
  transcriptStatus: TranscriptStatus;
  lastTranscribedAt?: Date;
  isKPRelated: boolean;
  analysis?: VideoAnalysisDto;
  createdAt: Date;
  updatedAt: Date;
}



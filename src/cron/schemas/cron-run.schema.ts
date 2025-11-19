import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CronRunDocument = CronRun & Document;

export enum CronRunStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class CronRun {
  @Prop({ required: true, index: true })
  jobType: string;

  @Prop({ required: true, type: Date, index: true })
  startedAt: Date;

  @Prop({ type: Date, required: false })
  finishedAt?: Date;

  @Prop({
    type: String,
    enum: CronRunStatus,
    default: CronRunStatus.RUNNING,
    index: true,
  })
  status: CronRunStatus;

  @Prop({ default: 0 })
  videosProcessed: number;

  @Prop({ required: false })
  errorMessage?: string;

  @Prop({ type: Object, required: false })
  meta?: Record<string, unknown>;
}

export const CronRunSchema = SchemaFactory.createForClass(CronRun);



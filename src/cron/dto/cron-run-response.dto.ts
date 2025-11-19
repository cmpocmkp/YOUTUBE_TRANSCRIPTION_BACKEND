import { CronRunStatus } from '../schemas/cron-run.schema';

export class CronRunResponseDto {
  _id: string;
  jobType: string;
  startedAt: Date;
  finishedAt?: Date;
  status: CronRunStatus;
  videosProcessed: number;
  errorMessage?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}



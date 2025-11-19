import { IsOptional, IsBoolean } from 'class-validator';

export class ReanalyzeDto {
  @IsOptional()
  @IsBoolean()
  forceRetranscribe?: boolean;
}



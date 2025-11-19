import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CronRunStatus } from '../schemas/cron-run.schema';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CronRunQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CronRunStatus)
  status?: CronRunStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}



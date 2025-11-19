import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { CronService } from './cron.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CronRunQueryDto } from './dto/cron-run-query.dto';

@Controller('api/cron-runs')
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get()
  async findAll(@Query() query: CronRunQueryDto): Promise<ApiResponseDto<unknown>> {
    const result = await this.cronService.findAll({
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    });

    return new ApiResponseDto(
      HttpStatus.OK,
      'Cron runs retrieved successfully',
      {
        data: result.data,
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 10,
      },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const cronRun = await this.cronService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'Cron run retrieved successfully', cronRun);
  }
}



import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CronService } from './cron.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CronRunQueryDto } from './dto/cron-run-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('api/cron-runs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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



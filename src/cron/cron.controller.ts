import {
  Controller,
  Get,
  Param,
  Query,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CronService } from './cron.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CronRunQueryDto } from './dto/cron-run-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Cron Runs')
@ApiBearerAuth('JWT-auth')
@Controller('cron-runs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get()
  @ApiOperation({ summary: 'List cron runs', description: 'Get all cron job execution logs with optional filters (requires admin or super_admin role)' })
  @ApiQuery({ name: 'status', required: false, enum: ['running', 'success', 'failed'], description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date filter (ISO date string)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date filter (ISO date string)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Cron runs retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
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
  @ApiOperation({ summary: 'Get cron run by ID', description: 'Get detailed information about a specific cron run (requires admin or super_admin role)' })
  @ApiParam({ name: 'id', description: 'Cron run ID' })
  @ApiResponse({ status: 200, description: 'Cron run retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Cron run not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const cronRun = await this.cronService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'Cron run retrieved successfully', cronRun);
  }
}



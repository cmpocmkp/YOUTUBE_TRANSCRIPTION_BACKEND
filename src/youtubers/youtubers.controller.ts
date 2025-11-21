import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { YouTubersService } from './youtubers.service';
import { CreateYouTuberDto } from './dto/create-youtuber.dto';
import { UpdateYouTuberDto } from './dto/update-youtuber.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('YouTubers')
@ApiBearerAuth('JWT-auth')
@Controller('youtubers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class YouTubersController {
  constructor(private readonly youTubersService: YouTubersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create YouTuber', description: 'Add a new YouTuber channel to monitor (requires admin or super_admin role)' })
  @ApiBody({ type: CreateYouTuberDto })
  @ApiResponse({ status: 201, description: 'YouTuber created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async create(@Body() createYouTuberDto: CreateYouTuberDto): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.create(createYouTuberDto);
    return new ApiResponseDto(HttpStatus.CREATED, 'YouTuber created successfully', youTuber);
  }

  @Get()
  @ApiOperation({ summary: 'List all YouTubers', description: 'Get all YouTuber channels' })
  @ApiResponse({ status: 200, description: 'YouTubers retrieved successfully' })
  async findAll(): Promise<ApiResponseDto<unknown>> {
    const youTubers = await this.youTubersService.findAll();
    return new ApiResponseDto(HttpStatus.OK, 'YouTubers retrieved successfully', youTubers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get YouTuber by ID', description: 'Get a specific YouTuber channel by ID' })
  @ApiParam({ name: 'id', description: 'YouTuber ID' })
  @ApiResponse({ status: 200, description: 'YouTuber retrieved successfully' })
  @ApiResponse({ status: 404, description: 'YouTuber not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'YouTuber retrieved successfully', youTuber);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update YouTuber', description: 'Update YouTuber channel information (requires admin or super_admin role)' })
  @ApiParam({ name: 'id', description: 'YouTuber ID' })
  @ApiBody({ type: UpdateYouTuberDto })
  @ApiResponse({ status: 200, description: 'YouTuber updated successfully' })
  @ApiResponse({ status: 404, description: 'YouTuber not found' })
  async update(
    @Param('id') id: string,
    @Body() updateYouTuberDto: UpdateYouTuberDto,
  ): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.update(id, updateYouTuberDto);
    return new ApiResponseDto(HttpStatus.OK, 'YouTuber updated successfully', youTuber);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete YouTuber', description: 'Delete a YouTuber channel (requires admin or super_admin role)' })
  @ApiParam({ name: 'id', description: 'YouTuber ID' })
  @ApiResponse({ status: 204, description: 'YouTuber deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.youTubersService.remove(id);
  }
}



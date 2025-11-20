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
import { YouTubersService } from './youtubers.service';
import { CreateYouTuberDto } from './dto/create-youtuber.dto';
import { UpdateYouTuberDto } from './dto/update-youtuber.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('api/youtubers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class YouTubersController {
  constructor(private readonly youTubersService: YouTubersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createYouTuberDto: CreateYouTuberDto): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.create(createYouTuberDto);
    return new ApiResponseDto(HttpStatus.CREATED, 'YouTuber created successfully', youTuber);
  }

  @Get()
  async findAll(): Promise<ApiResponseDto<unknown>> {
    const youTubers = await this.youTubersService.findAll();
    return new ApiResponseDto(HttpStatus.OK, 'YouTubers retrieved successfully', youTubers);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'YouTuber retrieved successfully', youTuber);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
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
  async remove(@Param('id') id: string): Promise<void> {
    await this.youTubersService.remove(id);
  }
}



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
} from '@nestjs/common';
import { YouTubersService } from './youtubers.service';
import { CreateYouTuberDto } from './dto/create-youtuber.dto';
import { UpdateYouTuberDto } from './dto/update-youtuber.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@Controller('api/youtubers')
export class YouTubersController {
  constructor(private readonly youTubersService: YouTubersService) {}

  @Post()
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
  async update(
    @Param('id') id: string,
    @Body() updateYouTuberDto: UpdateYouTuberDto,
  ): Promise<ApiResponseDto<unknown>> {
    const youTuber = await this.youTubersService.update(id, updateYouTuberDto);
    return new ApiResponseDto(HttpStatus.OK, 'YouTuber updated successfully', youTuber);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.youTubersService.remove(id);
  }
}



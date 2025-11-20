import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ReanalyzeDto } from './dto/reanalyze.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('youtubers/:channelId/videos')
  async findByChannel(@Param('channelId') channelId: string): Promise<ApiResponseDto<unknown>> {
    const videos = await this.videosService.findByChannelId(channelId);
    return new ApiResponseDto(HttpStatus.OK, 'Videos retrieved successfully', videos);
  }

  @Get('videos/:id')
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const video = await this.videosService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'Video retrieved successfully', video);
  }

  @Patch('videos/:id/reanalyze')
  @HttpCode(HttpStatus.OK)
  async reanalyze(
    @Param('id') id: string,
    @Body() reanalyzeDto: ReanalyzeDto,
  ): Promise<ApiResponseDto<unknown>> {
    if (reanalyzeDto.forceRetranscribe) {
      await this.videosService.resetForReanalysis(id);
    }
    const video = await this.videosService.findOne(id);
    return new ApiResponseDto(
      HttpStatus.OK,
      'Video marked for reanalysis',
      video,
    );
  }
}



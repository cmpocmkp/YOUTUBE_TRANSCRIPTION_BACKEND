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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ReanalyzeDto } from './dto/reanalyze.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Videos')
@ApiBearerAuth('JWT-auth')
@Controller('')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get('youtubers/:channelId/videos')
  @ApiOperation({ summary: 'Get videos by channel', description: 'Get all videos for a specific YouTuber channel' })
  @ApiParam({ name: 'channelId', description: 'YouTuber channel ID' })
  @ApiResponse({ status: 200, description: 'Videos retrieved successfully' })
  async findByChannel(@Param('channelId') channelId: string): Promise<ApiResponseDto<unknown>> {
    const videos = await this.videosService.findByChannelId(channelId);
    return new ApiResponseDto(HttpStatus.OK, 'Videos retrieved successfully', videos);
  }

  @Get('videos/:id')
  @ApiOperation({ summary: 'Get video by ID', description: 'Get a specific video with full details including transcript and analysis' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiResponse({ status: 200, description: 'Video retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<unknown>> {
    const video = await this.videosService.findOne(id);
    return new ApiResponseDto(HttpStatus.OK, 'Video retrieved successfully', video);
  }

  @Patch('videos/:id/reanalyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reanalyze video', description: 'Mark a video for re-analysis. Optionally force retranscription.' })
  @ApiParam({ name: 'id', description: 'Video ID' })
  @ApiBody({ type: ReanalyzeDto })
  @ApiResponse({ status: 200, description: 'Video marked for reanalysis' })
  @ApiResponse({ status: 404, description: 'Video not found' })
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



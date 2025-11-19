import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AppConfigService } from '../common/config/config.service';
import { FileUtil } from '../common/utils/file.util';
import * as ytDlpWrap from 'youtube-dl-exec';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(private configService: AppConfigService) {
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      params: {
        key: this.configService.youtubeApiKey,
      },
    });
  }

  async fetchRecentVideos(
    channelId: string,
    daysBack: number = 1,
  ): Promise<YouTubeVideo[]> {
    try {
      // First, get the uploads playlist ID for the channel
      const channelResponse = await this.axiosInstance.get('/channels', {
        params: {
          part: 'contentDetails',
          id: channelId,
        },
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        this.logger.warn(`Channel ${channelId} not found`);
        return [];
      }

      const uploadsPlaylistId =
        channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Calculate the date threshold
      const publishedAfter = new Date();
      publishedAfter.setDate(publishedAfter.getDate() - daysBack);
      const publishedAfterISO = publishedAfter.toISOString();

      // Fetch videos from the uploads playlist
      const videos: YouTubeVideo[] = [];
      let nextPageToken: string | undefined;

      do {
        const playlistResponse = await this.axiosInstance.get('/playlistItems', {
          params: {
            part: 'snippet,contentDetails',
            playlistId: uploadsPlaylistId,
            maxResults: 50,
            pageToken: nextPageToken,
          },
        });

        const videoIds = playlistResponse.data.items
          .map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)
          .join(',');

        if (videoIds) {
          const videoDetailsResponse = await this.axiosInstance.get('/videos', {
            params: {
              part: 'snippet',
              id: videoIds,
            },
          });

          for (const video of videoDetailsResponse.data.items) {
            const publishedAt = new Date(video.snippet.publishedAt);
            if (publishedAt >= publishedAfter) {
              videos.push({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description || '',
                publishedAt: video.snippet.publishedAt,
                channelId: video.snippet.channelId,
                channelTitle: video.snippet.channelTitle,
              });
            }
          }
        }

        nextPageToken = playlistResponse.data.nextPageToken;
      } while (nextPageToken);

      // Sort by published date (newest first)
      videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      this.logger.log(`Fetched ${videos.length} videos for channel ${channelId}`);
      return videos;
    } catch (error) {
      this.logger.error(`Error fetching videos for channel ${channelId}:`, error);
      throw error;
    }
  }

  async downloadVideoAudio(videoId: string): Promise<string> {
    const tempDir = FileUtil.getTempDir();
    await FileUtil.ensureDirectoryExists(tempDir);

    const outputPath = path.join(tempDir, `${videoId}.%(ext)s`);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      this.logger.log(`Downloading audio for video ${videoId}`);

      await ytDlpWrap.exec(videoUrl, {
        extractAudio: true,
        audioFormat: 'mp3',
        output: outputPath,
        noPlaylist: true,
      });

      // Find the actual output file (yt-dlp adds extension)
      const files = fs.readdirSync(tempDir);
      const downloadedFile = files.find((f) => f.startsWith(videoId) && f.endsWith('.mp3'));

      if (!downloadedFile) {
        throw new Error(`Failed to find downloaded audio file for video ${videoId}`);
      }

      const fullPath = path.join(tempDir, downloadedFile);
      this.logger.log(`Downloaded audio to ${fullPath}`);
      return fullPath;
    } catch (error) {
      this.logger.error(`Error downloading audio for video ${videoId}:`, error);
      throw error;
    }
  }

  async convertToMp3(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // If already MP3, just return the path
      if (inputPath.endsWith('.mp3')) {
        // Rename if needed
        if (inputPath !== outputPath) {
          fs.renameSync(inputPath, outputPath);
        }
        resolve(outputPath);
        return;
      }

      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioCodec('libmp3lame')
        .audioBitrate(128)
        .on('end', () => {
          this.logger.log(`Converted to MP3: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err: Error) => {
          this.logger.error(`FFmpeg error:`, err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await FileUtil.deleteFile(filePath);
      this.logger.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup file ${filePath}:`, error);
    }
  }
}


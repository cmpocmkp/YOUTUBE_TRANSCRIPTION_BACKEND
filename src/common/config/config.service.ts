import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get mongodbUri(): string {
    // Support both DB_URL and MONGODB_URI for flexibility
    return this.configService.get<string>('DB_URL') || 
           this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/youtube-transcription');
  }

  get openaiApiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  get youtubeApiKey(): string {
    return this.configService.get<string>('YOUTUBE_API_KEY') || '';
  }

  get cronSchedule(): string {
    return this.configService.get<string>('CRON_SCHEDULE', '0 3 * * *');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', 'your-secret-key-change-in-production');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '7d');
  }
}


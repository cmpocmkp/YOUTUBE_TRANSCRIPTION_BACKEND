import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from '../common/config/config.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private readonly openai: OpenAI;

  constructor(private configService: AppConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });
  }

  async transcribeAudio(mp3Path: string): Promise<string> {
    try {
      this.logger.log(`Transcribing audio file: ${mp3Path}`);

      if (!fs.existsSync(mp3Path)) {
        throw new Error(`Audio file not found: ${mp3Path}`);
      }

      // For Node.js, create a File-like object
      // OpenAI SDK accepts File objects, which are available in Node.js 18+
      const fileBuffer = fs.readFileSync(mp3Path);
      const file = new File([fileBuffer], path.basename(mp3Path), { type: 'audio/mpeg' });
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      });

      const transcript = typeof transcription === 'string' 
        ? transcription 
        : (transcription as { text?: string }).text || '';

      this.logger.log(`Transcription completed for ${mp3Path}`);
      return transcript;
    } catch (error) {
      this.logger.error(`Error transcribing audio ${mp3Path}:`, error);
      throw error;
    }
  }
}


import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfigService } from '../common/config/config.service';
import { VideoAnalysis, SentimentLabel } from '../videos/schemas/video.schema';

export interface AnalysisMetadata {
  title: string;
  channelName: string;
  publishedAt?: Date;
}

interface AnalysisResponse {
  isKPRelated: boolean;
  cmKp: {
    sentimentLabel: SentimentLabel;
    confidence: number;
    explanation: string;
  };
  kpGovernment: {
    sentimentLabel: SentimentLabel;
    confidence: number;
    explanation: string;
  };
  imranKhan: {
    sentimentLabel: SentimentLabel;
    confidence: number;
    explanation: string;
  };
}

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly openai: OpenAI;

  constructor(private configService: AppConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });
  }

  private getSystemPrompt(): string {
    return `You are an expert political analyst specializing in Pakistani politics, particularly focused on Khyber Pakhtunkhwa (KP) province.

Your task is to analyze video transcripts and determine:
1. Whether the content is KP-related (mentions KP, Khyber Pakhtunkhwa, Chief Minister KP, KP government, or Imran Khan in a KP context)
2. The sentiment toward three specific entities:
   - Chief Minister Khyber Pakhtunkhwa (CM KP)
   - Government of Khyber Pakhtunkhwa (KP Government)
   - Imran Khan

For each entity, provide:
- sentimentLabel: one of "positive", "negative", "neutral", "mixed", or "not_mentioned"
- confidence: a number between 0 and 1 indicating your confidence in the sentiment assessment
- explanation: a brief explanation (2-3 sentences) of why you assigned this sentiment

Return ONLY valid JSON in this exact format:
{
  "isKPRelated": true/false,
  "cmKp": {
    "sentimentLabel": "positive|negative|neutral|mixed|not_mentioned",
    "confidence": 0.0-1.0,
    "explanation": "..."
  },
  "kpGovernment": {
    "sentimentLabel": "positive|negative|neutral|mixed|not_mentioned",
    "confidence": 0.0-1.0,
    "explanation": "..."
  },
  "imranKhan": {
    "sentimentLabel": "positive|negative|neutral|mixed|not_mentioned",
    "confidence": 0.0-1.0,
    "explanation": "..."
  }
}

Be objective and base your analysis solely on the transcript content.`;
  }

  async analyzeTranscript(
    transcript: string,
    metadata: AnalysisMetadata,
  ): Promise<{ isKPRelated: boolean; analysis: VideoAnalysis }> {
    try {
      this.logger.log(`Analyzing transcript for video: ${metadata.title}`);

      const systemPrompt = this.getSystemPrompt();
      const userPrompt = `Video Title: ${metadata.title}
Channel: ${metadata.channelName}
${metadata.publishedAt ? `Published: ${metadata.publishedAt.toISOString()}` : ''}

Transcript:
${transcript}

Analyze this transcript and return the JSON response as specified.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Parse JSON response
      let analysisData: AnalysisResponse;
      try {
        analysisData = JSON.parse(content) as AnalysisResponse;
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI response as JSON:', content);
        throw new Error('Invalid JSON response from OpenAI');
      }

      // Validate and map to our schema
      const analysis: VideoAnalysis = {
        cmKp: {
          sentimentLabel: this.validateSentimentLabel(analysisData.cmKp.sentimentLabel),
          confidence: this.validateConfidence(analysisData.cmKp.confidence),
          explanation: analysisData.cmKp.explanation,
        },
        kpGovernment: {
          sentimentLabel: this.validateSentimentLabel(analysisData.kpGovernment.sentimentLabel),
          confidence: this.validateConfidence(analysisData.kpGovernment.confidence),
          explanation: analysisData.kpGovernment.explanation,
        },
        imranKhan: {
          sentimentLabel: this.validateSentimentLabel(analysisData.imranKhan.sentimentLabel),
          confidence: this.validateConfidence(analysisData.imranKhan.confidence),
          explanation: analysisData.imranKhan.explanation,
        },
      };

      this.logger.log(`Analysis completed for video: ${metadata.title}`);
      return {
        isKPRelated: analysisData.isKPRelated,
        analysis,
      };
    } catch (error) {
      this.logger.error(`Error analyzing transcript:`, error);
      throw error;
    }
  }

  private validateSentimentLabel(label: string): SentimentLabel {
    const validLabels: SentimentLabel[] = [
      SentimentLabel.POSITIVE,
      SentimentLabel.NEGATIVE,
      SentimentLabel.NEUTRAL,
      SentimentLabel.MIXED,
      SentimentLabel.NOT_MENTIONED,
    ];

    if (validLabels.includes(label as SentimentLabel)) {
      return label as SentimentLabel;
    }

    this.logger.warn(`Invalid sentiment label: ${label}, defaulting to neutral`);
    return SentimentLabel.NEUTRAL;
  }

  private validateConfidence(confidence: number): number {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, confidence));
  }
}



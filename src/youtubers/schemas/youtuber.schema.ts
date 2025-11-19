import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type YouTuberDocument = YouTuber & Document;

@Schema({ timestamps: true })
export class YouTuber {
  @Prop({ required: true, unique: true, index: true })
  channelId: string;

  @Prop({ required: true })
  channelName: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const YouTuberSchema = SchemaFactory.createForClass(YouTuber);


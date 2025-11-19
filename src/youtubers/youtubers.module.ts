import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { YouTubersService } from './youtubers.service';
import { YouTubersController } from './youtubers.controller';
import { YouTuber, YouTuberSchema } from './schemas/youtuber.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: YouTuber.name, schema: YouTuberSchema }]),
  ],
  controllers: [YouTubersController],
  providers: [YouTubersService],
  exports: [YouTubersService],
})
export class YouTubersModule {}



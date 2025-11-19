import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { YouTuber, YouTuberDocument } from './schemas/youtuber.schema';
import { CreateYouTuberDto } from './dto/create-youtuber.dto';
import { UpdateYouTuberDto } from './dto/update-youtuber.dto';

@Injectable()
export class YouTubersService {
  constructor(
    @InjectModel(YouTuber.name) private youTuberModel: Model<YouTuberDocument>,
  ) {}

  async create(createYouTuberDto: CreateYouTuberDto): Promise<YouTuber> {
    const youTuber = new this.youTuberModel(createYouTuberDto);
    return youTuber.save();
  }

  async findAll(): Promise<YouTuber[]> {
    return this.youTuberModel.find().exec();
  }

  async findActive(): Promise<YouTuber[]> {
    return this.youTuberModel.find({ isActive: true }).exec();
  }

  async findOne(id: string): Promise<YouTuber> {
    const youTuber = await this.youTuberModel.findById(id).exec();
    if (!youTuber) {
      throw new NotFoundException(`YouTuber with ID ${id} not found`);
    }
    return youTuber;
  }

  async findByChannelId(channelId: string): Promise<YouTuber | null> {
    return this.youTuberModel.findOne({ channelId }).exec();
  }

  async update(id: string, updateYouTuberDto: UpdateYouTuberDto): Promise<YouTuber> {
    const youTuber = await this.youTuberModel
      .findByIdAndUpdate(id, updateYouTuberDto, { new: true })
      .exec();
    if (!youTuber) {
      throw new NotFoundException(`YouTuber with ID ${id} not found`);
    }
    return youTuber;
  }

  async remove(id: string): Promise<void> {
    const result = await this.youTuberModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`YouTuber with ID ${id} not found`);
    }
  }
}



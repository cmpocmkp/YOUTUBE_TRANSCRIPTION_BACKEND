import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateYouTuberDto {
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @IsString()
  @IsNotEmpty()
  channelName: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



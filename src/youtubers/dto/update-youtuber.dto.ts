import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateYouTuberDto {
  @IsOptional()
  @IsString()
  channelName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



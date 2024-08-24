import { Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';

export class FindEventDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  likes: number = 0;
  @ApiProperty()
  comments: number = 0;
  @ApiProperty()
  createdAt!: Date;

  static of(event: Event): FindEventDto {
    const dto = new FindEventDto();
    dto.id = event.id;
    dto.title = event.title;
    dto.content = event.content;
    dto.media = event.media;
    dto.likes = event.likesCount;
    dto.comments = event.commentsCount;
    dto.createdAt = event.createdAt;
    return dto;
  }
}

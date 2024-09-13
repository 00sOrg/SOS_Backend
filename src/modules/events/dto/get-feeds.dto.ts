import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../entities';

export class GetFeedsDto {
  constructor(
    eventId: number,
    title: string,
    content?: string,
    media?: string,
  ) {
    this.eventId = eventId;
    this.title = title;
    this.content = content;
    this.media = media;
  }

  @ApiProperty()
  eventId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  media?: string;

  static of(events: Event[]): GetFeedsDto[] {
    return events.map((event) => {
      return new GetFeedsDto(event.id, event.title, event.content, event.media);
    });
  }
}

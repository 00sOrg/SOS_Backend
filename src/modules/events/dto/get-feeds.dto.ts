import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../entities';

class EventData {
  @ApiProperty()
  eventId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  media?: string;

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
}

export class GetFeedsDto {
  @ApiProperty({ type: [EventData] })
  events: EventData[];

  constructor(events: EventData[]) {
    this.events = events;
  }

  static of(events: Event[]): GetFeedsDto {
    const eventDatas = events.map((event) => {
      return new EventData(event.id, event.title, event.content, event.media);
    });
    return new GetFeedsDto(eventDatas);
  }
}

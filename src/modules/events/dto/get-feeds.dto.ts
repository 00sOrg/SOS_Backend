import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../entities';
import { EventType } from '../entities/enum/event-type.enum';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';

class EventData {
  @ApiProperty()
  eventId!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content?: string;

  @ApiProperty()
  media?: string;

  @ApiProperty()
  eventType: EventType;

  @ApiProperty()
  eventLevel: DisasterLevel;

  @ApiProperty()
  keywords: string[];

  constructor(
    eventId: number,
    title: string,
    eventType: EventType,
    disasterLevel: DisasterLevel,
    keywords: string[],
    content?: string,
    media?: string,
  ) {
    this.eventId = eventId;
    this.title = title;
    this.content = content;
    this.media = media;
    this.eventType = eventType;
    this.eventLevel = disasterLevel;
    this.keywords = keywords;
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
      const keywords = event.keywords!.map((keyword) => keyword.keyword);
      return new EventData(
        event.id,
        event.title,
        event.type,
        event.disasterLevel,
        keywords,
        event.content,
        event.media,
      );
    });
    return new GetFeedsDto(eventDatas);
  }
}

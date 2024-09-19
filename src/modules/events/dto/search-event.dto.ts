import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../entities';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';
import { EventType } from '../entities/enum/event-type.enum';

class EventDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  eventLevel: DisasterLevel;
  @ApiProperty()
  eventType: EventType;

  constructor(
    id: number,
    title: string,
    longitude: number,
    latitude: number,
    disasterLevel: DisasterLevel,
    eventType: EventType,
    content?: string,
    media?: string,
  ) {
    this.id = id;
    this.title = title;
    this.longitude = longitude;
    this.latitude = latitude;
    this.eventLevel = disasterLevel;
    this.eventType = eventType;
    this.content = content;
    this.media = media;
  }
}

export class SearchEventDto {
  @ApiProperty({ type: [EventDto] })
  events: EventDto[];

  constructor(events: EventDto[]) {
    this.events = events;
  }

  static of(events: Event[]): SearchEventDto {
    const eventList = events.map((event) => {
      return new EventDto(
        event.id,
        event.title,
        event.longitude,
        event.latitude,
        event.disasterLevel,
        event.type,
        event.content,
        event.media,
      );
    });
    return new SearchEventDto(eventList);
  }
}

import { Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/enum/event-type.enum';

class Events {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  eventType: EventType;
  public constructor(
    id: number,
    title: string,
    createdAt: Date,
    longitude: number,
    latitude: number,
    eventType: EventType,
    content?: string,
    media?: string,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.media = media;
    this.createdAt = createdAt;
    this.longitude = longitude;
    this.latitude = latitude;
    this.eventType = eventType;
  }
}

export class FindNearbyAllDto {
  @ApiProperty({ type: [Events] })
  events: Events[];
  @ApiProperty()
  eventsNumber: number;
  public constructor(events: Events[], eventsNumber: number) {
    this.events = events;
    this.eventsNumber = eventsNumber;
  }

  public static of(events: Event[]): FindNearbyAllDto {
    const eventList = events.map((event) => {
      return new Events(
        event.id,
        event.title,
        event.createdAt,
        event.longitude,
        event.latitude,
        event.type,
        event.content,
        event.media,
      );
    });
    return new FindNearbyAllDto(eventList, eventList.length);
  }
}

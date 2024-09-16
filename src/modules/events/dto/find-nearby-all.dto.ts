import { Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';

class Events {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  createdAt: Date;
  public constructor(
    id: number,
    title: string,
    createdAt: Date,
    content?: string,
    media?: string,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.media = media;
    this.createdAt = createdAt;
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
        event.content,
        event.media,
      );
    });
    return new FindNearbyAllDto(eventList, eventList.length);
  }
}

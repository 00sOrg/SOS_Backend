import { Event } from '../entities';
import { Region } from '../../../external/naver/dto/region.dto';
import { ApiProperty } from '@nestjs/swagger';

export class FindNearbyAllDto {
  @ApiProperty()
  si: string;
  @ApiProperty()
  gu: string;
  @ApiProperty()
  dong: string;
  @ApiProperty()
  events: Events[];
  @ApiProperty()
  eventsNumber: number;
  public constructor(
    si: string,
    gu: string,
    dong: string,
    events: Events[],
    eventsNumber: number,
  ) {
    this.si = si;
    this.gu = gu;
    this.dong = dong;
    this.events = events;
    this.eventsNumber = eventsNumber;
  }

  public static of(events: Event[], region: Region): FindNearbyAllDto {
    const eventList = events.map((event) => {
      return new Events(
        event.id,
        event.title,
        event.createdAt,
        event.content,
        event.media,
      );
    });
    return new FindNearbyAllDto(
      region.si,
      region.gu,
      region.dong,
      eventList,
      eventList.length,
    );
  }
}

class Events {
  id: number;
  title: string;
  content?: string;
  media?: string;
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

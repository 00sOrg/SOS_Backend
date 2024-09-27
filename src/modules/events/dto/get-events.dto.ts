import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/enum/event-type.enum';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';
import { Event } from '../entities';

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
  type: EventType;

  @ApiProperty()
  level: DisasterLevel;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  commentCount: number;

  constructor(
    id: number,
    title: string,
    type: EventType,
    level: DisasterLevel,
    likeCount: number,
    commentCount: number,
    content?: string,
    media?: string,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.media = media;
    this.type = type;
    this.level = level;
    this.likeCount = likeCount;
    this.commentCount = commentCount;
  }
}

export class GetEventsDto {
  @ApiProperty({ type: [EventDto] })
  events: EventDto[];

  constructor(events: EventDto[]) {
    this.events = events;
  }

  static of(events: Event[]) {
    return new GetEventsDto(
      events.map(
        (event) =>
          new EventDto(
            event.id,
            event.title,
            event.type,
            event.disasterLevel,
            event.likesCount,
            event.commentsCount,
            event.content,
            event.media,
          ),
      ),
    );
  }
}

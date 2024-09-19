import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../entities';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';
import { EventType } from '../entities/enum/event-type.enum';

export class FindEventOverviewDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  eventType: EventType;
  @ApiProperty()
  eventLevel: DisasterLevel;
  @ApiProperty()
  createdAt: Date;

  constructor(
    id: number,
    title: string,
    createdAt: Date,
    eventType: EventType,
    disasterLevel: DisasterLevel,
    media?: string,
    content?: string,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.media = media;
    this.eventType = eventType;
    this.eventLevel = disasterLevel;
    this.createdAt = createdAt;
  }

  static of(event: Event): FindEventOverviewDto {
    return new FindEventOverviewDto(
      event.id,
      event.title,
      event.createdAt,
      event.type,
      event.disasterLevel,
      event.media,
      event.content,
    );
  }
}

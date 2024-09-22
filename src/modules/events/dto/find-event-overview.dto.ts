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
  @ApiProperty()
  keywords: string[];

  constructor(
    id: number,
    title: string,
    createdAt: Date,
    eventType: EventType,
    disasterLevel: DisasterLevel,
    keywords: string[],
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
    this.keywords = keywords;
  }

  static of(event: Event): FindEventOverviewDto {
    const keywords = event.keywords!.map((keyword) => keyword.keyword);
    return new FindEventOverviewDto(
      event.id,
      event.title,
      event.createdAt,
      event.type,
      event.disasterLevel,
      keywords,
      event.media,
      event.content,
    );
  }
}

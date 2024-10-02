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
  memberNickname: string;
  @ApiProperty()
  memberProfile?: string;
  @ApiProperty()
  address?: string;
  @ApiProperty()
  eventType: EventType;
  @ApiProperty()
  eventLevel: DisasterLevel;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  keywords: string[];
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  longitude: number;

  constructor(
    id: number,
    title: string,
    createdAt: Date,
    eventType: EventType,
    disasterLevel: DisasterLevel,
    address: string,
    memberProfile: string,
    memberNickname: string,
    keywords: string[],
    latitude: number,
    longitude: number,
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
    this.address = address;
    this.memberProfile = memberProfile;
    this.memberNickname = memberNickname;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  static of(event: Event): FindEventOverviewDto {
    const keywords = event.keywords!.map((keyword) => keyword.keyword);
    return new FindEventOverviewDto(
      event.id,
      event.title,
      event.createdAt,
      event.type,
      event.disasterLevel,
      event.address,
      event.member.memberDetail!.profilePicture!,
      event.member.nickname,
      keywords,
      event.latitude,
      event.longitude,
      event.media,
      event.content,
    );
  }
}

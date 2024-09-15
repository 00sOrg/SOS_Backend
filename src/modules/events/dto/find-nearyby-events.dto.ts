import { Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../entities/enum/event-type.enum';

export class nearbyEvent {
  @ApiProperty()
  id: number;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  eventType: EventType;
  constructor(
    id: number,
    longitude: number,
    latitude: number,
    eventType: EventType,
    media?: string,
  ) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.media = media;
    this.eventType = eventType;
  }
}

export class FindNearybyDto {
  @ApiProperty({ type: [nearbyEvent] })
  events!: nearbyEvent[];

  static of(events: Event[]): FindNearybyDto {
    const dto = new FindNearybyDto();
    dto.events = events.map(
      (event) =>
        new nearbyEvent(
          event.id,
          event.longitude,
          event.latitude,
          event.type!,
          event.media,
        ),
    );
    return dto;
  }
}

import { Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';

export class nearbyEvent {
  @ApiProperty()
  id: number;
  @ApiProperty()
  longitude: number;
  @ApiProperty()
  latitude: number;
  @ApiProperty()
  media?: string;
  constructor(id: number, longitude: number, latitude: number, media?: string) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.media = media;
  }
}

export class FindNearybyDto {
  @ApiProperty({ type: [nearbyEvent] })
  events!: nearbyEvent[];

  static of(events: Event[]): FindNearybyDto {
    const dto = new FindNearybyDto();
    dto.events = events.map(
      (event) =>
        new nearbyEvent(event.id, event.longitude, event.latitude, event.media),
    );
    return dto;
  }
}

import { Event } from '../entities';

export class FindNearybyDto {
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

export class nearbyEvent {
  id: number;
  longitude: number;
  latitude: number;
  media: string;
  constructor(id: number, longitude: number, latitude: number, media: string) {
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
    this.media = media;
  }
}

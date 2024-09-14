import { Event } from '../event.entity';
import { Member } from '../../../members/entities';
import { EventType } from '../enum/event-type.enum';
import { DisasterLevel } from '../enum/disaster-level.enum';

export class EventBuilder {
  _event: Event;

  constructor() {
    this._event = new Event();
  }

  id(id: number): this {
    this._event.id = id;
    return this;
  }

  member(member: Member): this {
    this._event.member = member;
    return this;
  }

  type(type: EventType): this {
    this._event.type = type;
    return this;
  }

  media(media?: string): this {
    this._event.media = media;
    return this;
  }

  title(title: string): this {
    this._event.title = title;
    return this;
  }

  content(content?: string): this {
    this._event.content = content;
    return this;
  }

  latitude(latitude: number): this {
    this._event.latitude = latitude;
    return this;
  }

  longitude(longitude: number): this {
    this._event.longitude = longitude;
    return this;
  }

  address(address: string): this {
    this._event.address = address;
    return this;
  }

  disasterLevel(disasterLevel: DisasterLevel): this {
    this._event.disasterLevel = disasterLevel;
    return this;
  }

  likesCount(likesCount: number): this {
    this._event.likesCount = likesCount;
    return this;
  }

  commentsCount(commentsCount: number): this {
    this._event.commentsCount = commentsCount;
    return this;
  }

  build(): Event {
    return this._event;
  }
}

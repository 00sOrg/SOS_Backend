import { Event } from '../event.entity';
import { Member } from '../../../members/entities';
import { Comment } from '../comment.entity';

export class EventBuilder {
  private _event: Event;

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

  comments(comments: Comment[]): this {
    this._event.comments = comments as Comment[];
    return this;
  }

  type(type: string): this {
    this._event.type = type;
    return this;
  }

  media(media: string): this {
    this._event.media = media;
    return this;
  }

  title(title: string): this {
    this._event.title = title;
    return this;
  }

  content(content: string): this {
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

  si(si: string): this {
    this._event.si = si;
    return this;
  }

  gu(gu: string): this {
    this._event.gu = gu;
    return this;
  }

  dong(dong: string): this {
    this._event.dong = dong;
    return this;
  }

  disasterLevel(disasterLevel: string): this {
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

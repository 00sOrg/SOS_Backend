import { Like } from '../like.entity';
import { Event } from '../event.entity';
import { Member } from '../../../members/entities';

export class LikeBuilder {
  _like: Like;
  constructor() {
    this._like = new Like();
  }

  id(id: number): this {
    this._like.id = id;
    return this;
  }
  event(event: Event): this {
    this._like.event = event;
    return this;
  }
  member(member: Member): this {
    this._like.member = member;
    return this;
  }
  build(): Like {
    return this._like;
  }
}

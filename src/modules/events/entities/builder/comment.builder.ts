import { Member } from 'src/modules/members/entities';
import { Comment } from '../comment.entity';
import { Event } from '../event.entity';

export class CommentBuilder {
  private _comment: Comment;

  constructor() {
    this._comment = new Comment();
  }

  id(id: number): this {
    this._comment.id = id;
    return this;
  }

  event(event: Event): this {
    this._comment.event = event;
    return this;
  }

  member(member: Member): this {
    this._comment.member = member;
    return this;
  }

  content(content: string): this {
    this._comment.content = content;
    return this;
  }

  build(): Comment {
    return this._comment;
  }
}

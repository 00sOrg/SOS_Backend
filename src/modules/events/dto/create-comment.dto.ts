import { Member } from 'src/modules/members/entities';
import { Comment, Event } from '../entities';
import { CommentBuilder } from '../entities/builder/comment.builder';

export class CreateCommentDto {
  eventId: number;
  content: string;

  toComment(member: Member, event: Event): Comment {
    return new CommentBuilder()
      .member(member)
      .content(this.content)
      .event(event)
      .build();
  }
}

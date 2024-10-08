import { Member } from 'src/modules/members/entities';
import { Comment, Event } from '../entities';
import { CommentBuilder } from '../entities/builder/comment.builder';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  eventId!: number;
  @ApiProperty()
  content!: string;

  constructor(eventId: number, content: string) {
    this.eventId = eventId;
    this.content = content;
  }

  toComment(member: Member, event: Event): Comment {
    return new CommentBuilder()
      .member(member)
      .content(this.content)
      .event(event)
      .build();
  }
}

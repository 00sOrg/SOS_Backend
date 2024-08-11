import { Injectable } from '@nestjs/common';
import { MembersRepository } from 'src/modules/members/members.repository';
import { CommentRepository } from '../repository/comment.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { EventsRepository } from '../repository/events.repository';
import { CommentBuilder } from '../entities/builder/comment.builder';

@Injectable()
export class CommentService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async createComment(request: CreateCommentDto, memberId: number): Promise<void> {
    const member = await this.membersRepository.findById(memberId);
    if(!member){
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    const event = await this.eventsRepository.findById(request.eventId);
    if(!event){
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }

    const comment = new CommentBuilder()
      .event(event)
      .member(member)
      .content(request.content)
      .build();
    await this.commentRepository.create(comment);
  }
}

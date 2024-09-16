import { Injectable } from '@nestjs/common';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { CommentRepository } from '../repository/comment.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { EventsRepository } from '../repository/events.repository';
import { Member } from '../../members/entities';

@Injectable()
export class CommentService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async createComment(
    request: CreateCommentDto,
    member: Member,
  ): Promise<void> {
    const event = await this.eventsRepository.findOne(request.eventId);
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    const comment = request.toComment(member, event);
    event.addCommentCount();
    await this.eventsRepository.update(event);
    await this.commentRepository.create(comment);
  }
}

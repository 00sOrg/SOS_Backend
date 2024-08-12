import { Module } from '@nestjs/common';
import { EventsService } from './service/events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './repository/events.repository';
import { MembersRepository } from '../members/members.repository';
import { CommentService } from './service/comment.service';
import { CommentRepository } from './repository/comment.repository';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    MembersRepository,
    CommentService,
    CommentRepository,
  ],
})
export class EventsModule {}

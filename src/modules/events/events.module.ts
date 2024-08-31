import { Module } from '@nestjs/common';
import { EventsService } from './service/events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './repository/events.repository';
import { CommentService } from './service/comment.service';
import { CommentRepository } from './repository/comment.repository';
import { MembersModule } from '../members/members.module';
import { ExternalModule } from 'src/external/external.module';
import { LikeRepository } from './repository/like.repository';

@Module({
  imports: [MembersModule, ExternalModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    CommentService,
    CommentRepository,
    LikeRepository,
  ],
})
export class EventsModule {}

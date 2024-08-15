import { Module } from '@nestjs/common';
import { EventsService } from './service/events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './repository/events.repository';
import { MembersRepository } from '../members/members.repository';
import { CommentService } from './service/comment.service';
import { CommentRepository } from './repository/comment.repository';
import { MembersModule } from '../members/members.module';
import { ExternalModule } from 'src/external/external.module';

@Module({
  imports: [MembersModule, ExternalModule],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    CommentService,
    CommentRepository,
  ],
})
export class EventsModule {}

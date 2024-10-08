import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './repository/events.repository';
import { CommentService } from './services/comment.service';
import { CommentRepository } from './repository/comment.repository';
import { MembersModule } from '../members/members.module';
import { ExternalModule } from 'src/external/external.module';
import { LikeRepository } from './repository/like.repository';
import { NotificationModule } from '../alarm/notification.module';
import { KeywordRepository } from './repository/keyword.repository';

@Module({
  imports: [
    MembersModule,
    forwardRef(() => ExternalModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventsRepository,
    CommentService,
    CommentRepository,
    LikeRepository,
    KeywordRepository,
  ],
  exports: [EventsRepository, KeywordRepository],
})
export class EventsModule {}

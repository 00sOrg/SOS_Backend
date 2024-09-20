import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './services/notification.service';
import { MembersModule } from '../members/members.module';
import { ExternalModule } from '../../external/external.module';
import { NotificationRepository } from './notification.repository';
import { NotificationActionService } from './services/notification-action.service';
import { EventsModule } from '../events/events.module';
import { NotificationEventsHandler } from './services/notification-events.handler';

@Module({
  imports: [
    forwardRef(() => MembersModule), // forwardRef로 수정
    ExternalModule,
    forwardRef(() => EventsModule),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationActionService,
    NotificationEventsHandler,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}

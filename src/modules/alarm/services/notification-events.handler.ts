import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Member } from '../../members/entities';
import { NotificationType } from '../entities/enums/notificationType.enum';

@Injectable()
export class NotificationEventsHandler implements OnModuleInit {
  constructor(private readonly notificationService: NotificationService) {}

  onModuleInit() {
    console.log('NotificationEventsHandler initialized');
  }

  /**
   * 주변 사용자들에게 알림 생성
   */
  @OnEvent('notify.nearby')
  async handleNotifyNearbyEvent(payload: {
    members: Member[];
    eventId: number;
  }) {
    await Promise.all(
      payload.members.map((member) => {
        return this.notificationService.createNotification(
          NotificationType.NEARBY_EVENT,
          member,
          payload.eventId,
          'event',
        );
      }),
    );
  }

  /**
   * 사용자를 지인으로 등록한 사용자들에게 알림 생성
   */
  @OnEvent('notify.friends')
  async handleNotifyFriendsEvent(payload: { members: Member[] }) {
    await Promise.all(
      payload.members.map((member) => {
        member.favoritedByMembers.forEach((favoritedByMember) => {
          return this.notificationService.createNotification(
            NotificationType.FAVORITE_NEARBY_EVENT,
            favoritedByMember.member,
            member.id,
            'member',
          );
        });
      }),
    );
  }
}

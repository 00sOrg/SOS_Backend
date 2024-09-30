import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Favorite, Member } from '../../members/entities';
import { NotificationType } from '../entities/enums/notificationType.enum';

@Injectable()
export class NotificationEventsHandler implements OnModuleInit {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
    this.eventEmitter.emit('fcm.nearby', {
      receivers: payload.members,
      eventId: payload.eventId,
    });
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
          this.eventEmitter.emit('fcm.friends', {
            receiver: member,
            favoritedMember: favoritedByMember,
          });
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

  /**
   * 지인 등록 요청 알림 생성
   */
  @OnEvent('notify.favoriteRequest')
  async handleNotifyFavoriteRequestEvent(payload: {
    member: Member;
    favorite: Favorite;
  }) {
    const targetMemter = payload.favorite.favoritedMember;
    this.eventEmitter.emit('fcm.favoriteRequest', {
      receiver: targetMemter,
      sender: payload.member,
    });
    await this.notificationService.createNotification(
      NotificationType.FAVORITE_REQUEST,
      targetMemter,
      payload.favorite.id,
      'favorite',
    );
  }
}

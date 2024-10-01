import { Injectable, OnModuleInit } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Member } from '../../modules/members/entities';
import {
  formatNotificationMessage,
  NotificationMessage,
} from '../../modules/alarm/entities/enums/notificationMessage.enum';
import { NotificationTitle } from '../../modules/alarm/entities/enums/notificationType.enum';

@Injectable()
export class FcmEventsHandler implements OnModuleInit {
  constructor(private readonly fcmService: FcmService) {}

  onModuleInit() {
    console.log('FcmEventsHandler initialized');
  }

  /**
   * 도움 요청 push notification
   */
  @OnEvent('fcm.helpRequest')
  async handleFcmHelpRequest(payload: { receivers: Member[]; sender: Member }) {
    const tokens = payload.receivers.map((member) => member.device);
    const body = formatNotificationMessage(NotificationMessage.HELP_REQUEST, {
      nickname: payload.sender.nickname,
    });
    const message = this.fcmService.makeMulticastMessage(
      NotificationTitle.HELP_REQUEST,
      body,
      tokens,
    );
    await this.fcmService.sendMultipleNotifications(message);
  }
  /**
   * 주변 사용자들에게 push notification
   */
  @OnEvent('fcm.nearby')
  async handleFcmNearby(payload: { receivers: Member[]; eventId: number }) {
    const tokens = payload.receivers.map((member) => member.device);
    const body = formatNotificationMessage(
      NotificationMessage.NEARBY_EVENT,
      {},
    );
    const message = this.fcmService.makeMulticastMessage(
      NotificationTitle.NEARBY_EVENT,
      body,
      tokens,
    );
    await this.fcmService.sendMultipleNotifications(message);
  }
  /**
   * 사용자를 지인으로 등록한 사용자들에게 push notification
   */
  @OnEvent('fcm.friends')
  async handleFcmFriends(payload: {
    receiver: Member;
    favoritedMember: Member;
  }) {
    const token = payload.receiver.device;
    const body = formatNotificationMessage(
      NotificationMessage.FAVORITE_NEARBY_EVENT,
      {
        nickname: payload.favoritedMember.nickname,
      },
    );
    const message = this.fcmService.makeMessage(
      NotificationTitle.FAVORITE_NEARBY_EVENT,
      body,
      token,
    );
    await this.fcmService.sendNotification(message);
  }

  /**
   * 지인 요청을 보낸 사용자에게 push notification
   */
  @OnEvent('fcm.favoriteRequest')
  async handleFcmFavoriteRequest(payload: {
    receiver: Member;
    sender: Member;
  }) {
    const token = payload.receiver.device;
    const body = formatNotificationMessage(
      NotificationMessage.FAVORITE_REQUEST,
      { sender: payload.sender.nickname },
    );
    const message = this.fcmService.makeMessage(
      NotificationTitle.FAVORITE_REQUEST,
      body,
      token,
    );
    await this.fcmService.sendNotification(message);
  }
}

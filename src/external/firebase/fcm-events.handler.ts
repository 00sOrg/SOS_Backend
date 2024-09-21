import { Injectable, OnModuleInit } from '@nestjs/common';
import { FcmService } from './fcm.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Member } from '../../modules/members/entities';
import {
  formatNotificationMessage,
  NotificationMessage,
} from '../../modules/alarm/entities/enums/notificationMessage.enum';
import { NotificationType } from '../../modules/alarm/entities/enums/notificationType.enum';

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
      NotificationType.HELP_REQUEST,
      body,
      tokens,
    );
    await this.fcmService.sendMultipleNotifications(message);
  }
}

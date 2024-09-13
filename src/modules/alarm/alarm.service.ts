import { Injectable } from '@nestjs/common';
import { FcmService } from '../../external/firebase/fcm.service';
import { Member } from '../members/entities';
import {
  formatNotificationMessage,
  NotificationMessage,
} from './entities/enums/notificationMessage.enum';
import { NotificationType } from './entities/enums/notificationType.enum';
import { NotificationBuilder } from './entities/builder/notification.builder';
import { AlarmRepository } from './alarm.repository';

@Injectable()
export class AlarmService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly alarmRepository: AlarmRepository,
  ) {}

  /**
   * 주변 사용자들에게 알림을 보냄
   */
  async sendNotificationsToNearby(
    receivers: Member[],
    sender: Member,
  ): Promise<void> {
    const tokens = receivers.map((member) => member.device);
    const body = formatNotificationMessage(NotificationMessage.HELP_REQUEST, {
      nickname: sender.nickname,
    });
    const message = this.fcmService.makeMulticastMessage(
      NotificationType.HELP_REQUEST,
      body,
      tokens,
    );
    const notifications = receivers.map((member) => {
      return new NotificationBuilder()
        .type(NotificationType.HELP_REQUEST)
        .referenceId(sender.id)
        .referenceTable('member')
        .member(member)
        .build();
    });
    await this.fcmService.sendMultipleNotifications(message);
    await this.alarmRepository.createNotifications(notifications);
  }
}

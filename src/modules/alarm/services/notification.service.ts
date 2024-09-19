import { Injectable } from '@nestjs/common';
import { FcmService } from '../../../external/firebase/fcm.service';
import { Member } from '../../members/entities';
import {
  formatNotificationMessage,
  NotificationMessage,
} from '../entities/enums/notificationMessage.enum';
import { NotificationType } from '../entities/enums/notificationType.enum';
import { NotificationBuilder } from '../entities/builder/notification.builder';
import { NotificationRepository } from '../notification.repository';
import { Notification } from '../entities/notification.entity';
import { NotificationActionService } from './notification-action.service';
import {
  GetNotificationsDto,
  NotificationDto,
} from '../dto/get-notifications.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationActionService: NotificationActionService,
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
    await this.notificationRepository.createNotifications(notifications);
  }

  /**
   * 사용자가 받은 알림 조회
   */
  async getNotifications(member: Member): Promise<GetNotificationsDto> {
    const notifications =
      await this.notificationRepository.getNotificationsByMember(member.id);
    const notificationDtos = Promise.all(
      notifications.map((notification) =>
        this.formatNotificationDetails(notification),
      ),
    );
    return new GetNotificationsDto(await notificationDtos);
  }

  private async formatNotificationDetails(notification: Notification) {
    const actionDetails =
      await this.notificationActionService.getActionDetails(notification);
    return new NotificationDto(
      notification.id,
      notification.type,
      notification.isRead,
      notification.createdAt,
      actionDetails!.id,
      actionDetails!.message,
      actionDetails!.url,
    );
  }
}

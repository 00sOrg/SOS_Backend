import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../entities/enums/notificationType.enum';

export class NotificationDto {
  @ApiProperty()
  notificationId: number;
  @ApiProperty()
  notificationType: NotificationType;
  @ApiProperty()
  isRead: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  referenceId: number;
  @ApiProperty()
  notificationMessage: string;
  @ApiProperty()
  apiUrl?: string;

  constructor(
    notificationId: number,
    notificationType: NotificationType,
    isRead: boolean,
    createdAt: Date,
    referenceId: number,
    notificationMessage: string,
    apiUrl?: string,
  ) {
    this.notificationId = notificationId;
    this.notificationType = notificationType;
    this.isRead = isRead;
    this.createdAt = createdAt;
    this.notificationMessage = notificationMessage;
    this.referenceId = referenceId;
    this.apiUrl = apiUrl;
  }
}

export class GetNotificationsDto {
  @ApiProperty({ type: [NotificationDto] })
  notifications: NotificationDto[];

  constructor(notifications: NotificationDto[]) {
    this.notifications = notifications;
  }
}

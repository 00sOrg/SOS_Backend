import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ExceptionHandler } from '../../common/filters/exception/exception.handler';
import { ErrorStatus } from '../../common/api/status/error.status';
import { NotificationType } from '../../modules/alarm/entities/enums/notificationType.enum';

@Injectable()
export class FcmService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {}

  async sendNotification(token: string, message: admin.messaging.Message) {
    try {
      await this.firebaseAdmin.messaging().send(message);
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new ExceptionHandler(ErrorStatus.FIREBASE_MESSAGE_ERROR);
    }
  }

  async sendMultipleNotifications(message: admin.messaging.MulticastMessage) {
    try {
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      console.log('Notifications sent successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw new ExceptionHandler(ErrorStatus.FIREBASE_MESSAGE_ERROR);
    }
  }

  makeMulticastMessage(
    title: NotificationType,
    body: string,
    tokens: string[],
  ): admin.messaging.MulticastMessage {
    return {
      notification: {
        title,
        body,
      },
      tokens,
    };
  }
}

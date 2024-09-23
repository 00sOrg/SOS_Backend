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

  async sendNotification(message: admin.messaging.Message) {
    try {
      await this.firebaseAdmin.messaging().send(message);
    } catch (error) {
      throw new ExceptionHandler(ErrorStatus.FIREBASE_MESSAGE_ERROR);
    }
  }

  async sendMultipleNotifications(message: admin.messaging.MulticastMessage) {
    try {
      await this.firebaseAdmin.messaging().sendEachForMulticast(message);
    } catch (error) {
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

  makeMessage(
    title: NotificationType,
    body: string,
    token: string,
  ): admin.messaging.Message {
    return {
      notification: {
        title,
        body,
      },
      token,
    };
  }
}

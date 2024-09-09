import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ExceptionHandler } from '../../common/filters/exception/exception.handler';
import { ErrorStatus } from '../../common/api/status/error.status';

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
}

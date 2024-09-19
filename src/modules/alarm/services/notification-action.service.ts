import { Injectable } from '@nestjs/common';
import { FavoritesRepository } from '../../members/repository/favorites.repository';
import { NotificationType } from '../entities/enums/notificationType.enum';
import { Notification } from '../entities/notification.entity';
import { ExceptionHandler } from '../../../common/filters/exception/exception.handler';
import { ErrorStatus } from '../../../common/api/status/error.status';
import {
  formatNotificationMessage,
  NotificationMessage,
} from '../entities/enums/notificationMessage.enum';

@Injectable()
export class NotificationActionService {
  constructor(private readonly favoritesRepository: FavoritesRepository) {}

  async getActionDetails(notification: Notification) {
    switch (notification.type) {
      case NotificationType.FAVORITE_REQUEST:
        return this.processFavoriteRequest(notification);
    }
  }

  private async processFavoriteRequest(notification: Notification) {
    const favorite = await this.favoritesRepository.findById(
      notification.referenceId,
    );
    if (!favorite) throw new ExceptionHandler(ErrorStatus.FAVORITE_NOT_FOUND);
    return {
      id: favorite.member.id,
      message: formatNotificationMessage(NotificationMessage.FAVORITE_REQUEST, {
        sender: favorite.member.nickname,
      }),
      url: '/members/favorite/accept/{memberId}',
    };
  }
}

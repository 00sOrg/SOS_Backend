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
import { EventsRepository } from '../../events/repository/events.repository';

@Injectable()
export class NotificationActionService {
  constructor(
    private readonly favoritesRepository: FavoritesRepository,
    private readonly eventsRepository: EventsRepository,
  ) {}

  async getActionDetails(notification: Notification) {
    const handler = this.actionHandlers[notification.type];
    return handler(notification);
  }

  private readonly actionHandlers = {
    [NotificationType.FAVORITE_REQUEST]: this.processFavoriteRequest.bind(this),
    [NotificationType.NEARBY_EVENT]: this.processNearbyEvent.bind(this),
  };

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

  private async processNearbyEvent(notification: Notification) {
    const event = await this.eventsRepository.findById(
      notification.referenceId,
    );
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    return {
      id: event.id,
      message: formatNotificationMessage(NotificationMessage.NEARBY_EVENT, {}),
      url: '/events/{id}',
    };
  }
}

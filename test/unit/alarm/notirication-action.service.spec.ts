import { NotificationActionService } from '../../../src/modules/alarm/services/notification-action.service';
import { FavoritesRepository } from '../../../src/modules/members/repository/favorites.repository';
import { Test } from '@nestjs/testing';
import { NotificationBuilder } from '../../../src/modules/alarm/entities/builder/notification.builder';
import { NotificationType } from '../../../src/modules/alarm/entities/enums/notificationType.enum';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { FavoriteBuilder } from '../../../src/modules/members/entities/builder/favorite.builder';
import {
  formatNotificationMessage,
  NotificationMessage,
} from '../../../src/modules/alarm/entities/enums/notificationMessage.enum';
import { ErrorStatus } from '../../../src/common/api/status/error.status';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { EventsRepository } from '../../../src/modules/events/repository/events.repository';

describe('NotificationActionService', () => {
  let notificationActionService: NotificationActionService;
  let favoritesRepository: FavoritesRepository;
  let eventsRepository: EventsRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationActionService,
        {
          provide: FavoritesRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();
    notificationActionService = module.get<NotificationActionService>(
      NotificationActionService,
    );
    favoritesRepository = module.get<FavoritesRepository>(FavoritesRepository);
    eventsRepository = module.get(EventsRepository);
  });

  describe('getActionDetails', () => {
    it('should return details successfully', async () => {
      const member = new MemberBuilder().id(1).nickname('test').build();
      const notification = new NotificationBuilder()
        .id(1)
        .type(NotificationType.FAVORITE_REQUEST)
        .referenceId(1)
        .referenceTable('favorite')
        .build();
      const favorite = new FavoriteBuilder().id(1).member(member).build();
      const message = formatNotificationMessage(
        NotificationMessage.FAVORITE_REQUEST,
        {
          sender: member.nickname,
        },
      );

      jest.spyOn(favoritesRepository, 'findById').mockResolvedValue(favorite);
      const result =
        await notificationActionService.getActionDetails(notification);
      expect(favoritesRepository.findById).toHaveBeenCalledWith(
        notification.referenceId,
      );
      expect(result!.id).toEqual(member.id);
      expect(result!.message).toEqual(message);
    });

    it('should throw FAVORITE_NOT_FOUND if the favorite is not found', async () => {
      jest.spyOn(favoritesRepository, 'findById').mockResolvedValue(null);
      const notification = new NotificationBuilder()
        .id(1)
        .type(NotificationType.FAVORITE_REQUEST)
        .referenceId(1)
        .build();

      await expect(
        notificationActionService.getActionDetails(notification),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.FAVORITE_NOT_FOUND));
    });

    it('should throw EVENT_NOT_FOUND if the event does not exist', async () => {
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(null);
      const notification = new NotificationBuilder()
        .id(1)
        .type(NotificationType.NEARBY_EVENT)
        .referenceId(1)
        .build();
      await expect(
        notificationActionService.getActionDetails(notification),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND));
    });
  });
});

import { NotificationService } from '../../../src/modules/alarm/services/notification.service';
import { FcmService } from '../../../src/external/firebase/fcm.service';
import { NotificationActionService } from '../../../src/modules/alarm/services/notification-action.service';
import { Test } from '@nestjs/testing';
import { NotificationRepository } from '../../../src/modules/alarm/notification.repository';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { NotificationBuilder } from '../../../src/modules/alarm/entities/builder/notification.builder';
import { NotificationType } from '../../../src/modules/alarm/entities/enums/notificationType.enum';
import { GetNotificationsDto } from '../../../src/modules/alarm/dto/get-notifications.dto';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let fcmService: FcmService;
  let notificationActionService: NotificationActionService;
  let notificatonRepository: NotificationRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: NotificationRepository,
          useValue: {
            crete: jest.fn(),
            createNotifications: jest.fn(),
            getNotificationsByMember: jest.fn(),
          },
        },
        {
          provide: NotificationActionService,
          useValue: {
            getActionDetails: jest.fn(),
          },
        },
        {
          provide: FcmService,
          useValue: {
            sendMultipleNotifications: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    fcmService = module.get<FcmService>(FcmService);
    notificationActionService = module.get<NotificationActionService>(
      NotificationActionService,
    );
    notificatonRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );
  });

  describe('getNotifications', () => {
    it('should return notifications successfully', async () => {
      const member = new MemberBuilder().id(1).build();
      const notification = new NotificationBuilder()
        .id(1)
        .member(member)
        .type(NotificationType.FAVORITE_REQUEST)
        .referenceId(1)
        .referenceTable('favorite')
        .build();
      const notifications = [notification];
      jest
        .spyOn(notificatonRepository, 'getNotificationsByMember')
        .mockResolvedValue(notifications);
      jest
        .spyOn(notificationActionService, 'getActionDetails')
        .mockResolvedValue({ id: 1, message: 'test', url: '/test' });

      const result = await notificationService.getNotifications(member);
      const expectedNotification = result.notifications[0];
      expect(
        notificatonRepository.getNotificationsByMember,
      ).toHaveBeenCalledWith(member.id);
      expect(notificationActionService.getActionDetails).toHaveBeenCalledWith(
        notification,
      );
      expect(result).toBeInstanceOf(GetNotificationsDto);
      expect(expectedNotification.notificationMessage).toBe('test');
      expect(expectedNotification.referenceId).toBe(1);
      expect(expectedNotification.apiUrl).toBe('/test');
    });
  });
});

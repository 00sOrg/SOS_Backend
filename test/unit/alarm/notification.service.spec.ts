import { NotificationService } from '../../../src/modules/alarm/services/notification.service';
import { NotificationActionService } from '../../../src/modules/alarm/services/notification-action.service';
import { Test } from '@nestjs/testing';
import { NotificationRepository } from '../../../src/modules/alarm/notification.repository';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { NotificationBuilder } from '../../../src/modules/alarm/entities/builder/notification.builder';
import { NotificationType } from '../../../src/modules/alarm/entities/enums/notificationType.enum';
import { GetNotificationsDto } from '../../../src/modules/alarm/dto/get-notifications.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FavoriteBuilder } from '../../../src/modules/members/entities/builder/favorite.builder';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationActionService: NotificationActionService;
  let notificationRepository: NotificationRepository;
  let eventEmitter: EventEmitter2;

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
            markAsRead: jest.fn(),
            deleteFavoriteNotification: jest.fn(),
          },
        },
        {
          provide: NotificationActionService,
          useValue: {
            getActionDetails: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    notificationActionService = module.get<NotificationActionService>(
      NotificationActionService,
    );
    notificationRepository = module.get<NotificationRepository>(
      NotificationRepository,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });
  describe('requestHelpToNearby', () => {
    it('should emit an event and create notifications for nearby members', async () => {
      const member1 = new MemberBuilder().id(1).build();
      const member2 = new MemberBuilder().id(2).build();
      const receivers = [member1, member2];
      const sender = new MemberBuilder().id(3).build();

      const notifications = receivers.map((receiver) =>
        new NotificationBuilder()
          .type(NotificationType.HELP_REQUEST)
          .referenceId(sender.id)
          .referenceTable('member')
          .member(receiver)
          .build(),
      );

      jest
        .spyOn(notificationRepository, 'createNotifications')
        .mockResolvedValue(undefined);
      jest.spyOn(eventEmitter, 'emit');

      await notificationService.requestHelpToNearby(receivers, sender);

      expect(notificationRepository.createNotifications).toHaveBeenCalledWith(
        notifications,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('fcm.helpRequest', {
        receivers: receivers,
        sender: sender,
      });
    });
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
        .spyOn(notificationRepository, 'getNotificationsByMember')
        .mockResolvedValue(notifications);
      jest
        .spyOn(notificationActionService, 'getActionDetails')
        .mockResolvedValue({ id: 1, message: 'test', url: '/test' });

      const result = await notificationService.getNotifications(member);
      const expectedNotification = result.notifications[0];
      expect(
        notificationRepository.getNotificationsByMember,
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
  describe('markAsRead', () => {
    it('should mark the notification as read', async () => {
      const member = new MemberBuilder().id(1).build();
      const notificationId = 1;
      jest.spyOn(notificationRepository, 'markAsRead');
      await notificationService.markAsRead(member, notificationId);

      expect(notificationRepository.markAsRead).toHaveBeenCalledWith(
        member.id,
        notificationId,
      );
    });
  });
  describe('deleteFavoriteNotification', () => {
    it('should delete favorite notification', async () => {
      const favorite = new FavoriteBuilder().id(1).build();
      await notificationService.deleteFavoriteNotification(favorite);
      expect(
        notificationRepository.deleteFavoriteNotification,
      ).toHaveBeenCalledWith(favorite.id);
    });
  });
});

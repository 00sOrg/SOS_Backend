import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsHandler } from '../../../src/modules/alarm/services/notification-events.handler';
import { NotificationService } from '../../../src/modules/alarm/services/notification.service';
import { NotificationType } from '../../../src/modules/alarm/entities/enums/notificationType.enum';
import { MemberBuilder } from '../../../src/modules/members/entities/builder/member.builder';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('NotificationEventsHandler', () => {
  let handler: NotificationEventsHandler;
  let notificationService: NotificationService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsHandler,
        {
          provide: NotificationService,
          useValue: {
            createNotification: jest.fn(),
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

    handler = module.get<NotificationEventsHandler>(NotificationEventsHandler);
    notificationService = module.get<NotificationService>(NotificationService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('handleNotifyNearbyEvent', () => {
    it('should create notifications for nearby members', async () => {
      const member1 = new MemberBuilder().id(1).build();
      const member2 = new MemberBuilder().id(2).build();
      const members = [member1, member2];
      const payload = {
        members,
        eventId: 1,
        eventType: NotificationType.NEARBY_EVENT,
      };

      await handler.handleNotifyNearbyEvent(payload);

      expect(notificationService.createNotification).toHaveBeenCalledTimes(2);
      members.forEach((member) => {
        expect(notificationService.createNotification).toHaveBeenCalledWith(
          NotificationType.NEARBY_EVENT,
          member,
          payload.eventId,
          'event',
        );
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('fcm.nearby', {
        receivers: members,
        eventId: payload.eventId,
      });
    });
  });

  describe('handleNotifyFriendsEvent', () => {
    it('should create notifications for members favorited by other users', async () => {
      const member1 = new MemberBuilder().id(1).build();
      const member2 = new MemberBuilder().id(2).build();
      const favoritingMember1 = new MemberBuilder().id(3).build();
      const favoritingMember2 = new MemberBuilder().id(4).build();

      member1.favoritedByMembers = [
        { member: favoritingMember1 } as any,
        { member: favoritingMember2 } as any,
      ];
      member2.favoritedByMembers = [{ member: favoritingMember2 } as any];

      const members = [member1, member2];
      const payload = {
        members,
        eventType: NotificationType.FAVORITE_NEARBY_EVENT,
      };
      await handler.handleNotifyFriendsEvent(payload);
      expect(notificationService.createNotification).toHaveBeenCalledTimes(3);
      members.forEach((member) => {
        member.favoritedByMembers.forEach((favoritedByMember) => {
          expect(eventEmitter.emit).toHaveBeenCalledWith('fcm.friends', {
            receiver: member,
            favoritedMember: favoritedByMember,
          });
          expect(notificationService.createNotification).toHaveBeenCalledWith(
            NotificationType.FAVORITE_NEARBY_EVENT,
            favoritedByMember.member,
            member.id,
            'member',
          );
        });
      });
    });
  });
});

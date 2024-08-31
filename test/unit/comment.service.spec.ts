import { Test, TestingModule } from '@nestjs/testing';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { CreateCommentDto } from 'src/modules/events/dto/create-comment.dto';
import { Event } from 'src/modules/events/entities';
import { CommentRepository } from 'src/modules/events/repository/comment.repository';
import { EventsRepository } from 'src/modules/events/repository/events.repository';
import { CommentService } from 'src/modules/events/service/comment.service';
import { Member } from 'src/modules/members/entities';
import { MembersRepository } from 'src/modules/members/repository/members.repository';

describe('CommentService', () => {
  let commentService: CommentService;
  let memberRepository: Partial<jest.Mocked<MembersRepository>>;
  let eventsRepository: Partial<jest.Mocked<EventsRepository>>;
  let commentRepository: Partial<jest.Mocked<CommentRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: MembersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventsRepository,
          useValue: {
            findById: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CommentRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    memberRepository = module.get(MembersRepository);
    eventsRepository = module.get(EventsRepository);
    commentRepository = module.get(CommentRepository);
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const request = Object.assign(new CreateCommentDto(), {
        eventId: 1,
        content: 'test',
      });
      const memberId = 1;
      const member = new Member();
      const event = new Event();

      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(event);

      await commentService.createComment(request, memberId);

      expect(memberRepository.findById).toHaveBeenCalledWith(1);
      expect(eventsRepository.findOne).toHaveBeenCalledWith(1);
      expect(eventsRepository.update).toHaveBeenCalledTimes(1);
      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'test',
          event: event,
          member: member,
        }),
      );
      expect(event.commentsCount).toBe(1);
    });

    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      const request = Object.assign(new CreateCommentDto(), {
        eventId: 1,
        content: 'test',
      });
      const memberid = 1;
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(null);
      await expect(
        commentService.createComment(request, memberid),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });

    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      const request = Object.assign(new CreateCommentDto(), {
        eventId: 1,
        content: 'test',
      });
      const memberid = 1;
      const member = new Member();
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(null);

      await expect(
        commentService.createComment(request, memberid),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND));
    });
  });
});

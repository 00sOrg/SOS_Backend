import { Test, TestingModule } from '@nestjs/testing';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { CreateCommentDto } from 'src/modules/events/dto/create-comment.dto';
import { CommentRepository } from 'src/modules/events/repository/comment.repository';
import { EventsRepository } from 'src/modules/events/repository/events.repository';
import { CommentService } from 'src/modules/events/services/comment.service';
import { Member } from 'src/modules/members/entities';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { MemberBuilder } from '../../src/modules/members/entities/builder/member.builder';
import { EventBuilder } from '../../src/modules/events/entities/builder/event.builder';

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
    let member: Member;

    beforeEach(async () => {
      member = new MemberBuilder().id(1).build();
    });

    it('should create a comment successfully', async () => {
      const request = new CreateCommentDto(1, 'test');
      const event = new EventBuilder().id(1).commentsCount(1).build();

      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(event);

      await commentService.createComment(request, member);

      expect(eventsRepository.findOne).toHaveBeenCalledWith(1);
      expect(eventsRepository.update).toHaveBeenCalledTimes(1);
      expect(commentRepository.create).toHaveBeenCalledWith(
        request.toComment(member, event),
      );
      expect(event.commentsCount).toBe(2);
    });

    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      const request = new CreateCommentDto(1, 'test');
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(null);

      await expect(
        commentService.createComment(request, member),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND));
    });
  });
});

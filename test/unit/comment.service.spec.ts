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
import { Comment } from '../../src/modules/events/entities';
import { CommentBuilder } from '../../src/modules/events/entities/builder/comment.builder';

describe('CommentService', () => {
  let commentService: CommentService;
  let eventsRepository: Partial<jest.Mocked<EventsRepository>>;
  let commentRepository: Partial<jest.Mocked<CommentRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
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
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
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

  describe('deleteComment', () => {
    let comment: Comment;
    let member: Member;

    beforeEach(async () => {
      member = new MemberBuilder().id(1).build();
      const event = new EventBuilder().id(1).commentsCount(1).build();
      comment = new CommentBuilder().id(1).member(member).event(event).build();
    });

    it('should delete a comment successfully', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(comment.event);
      jest.spyOn(eventsRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(commentRepository, 'delete').mockResolvedValue(undefined);

      await commentService.deleteComment(1, member);

      expect(commentRepository.findOne).toHaveBeenCalledWith(1);
      expect(eventsRepository.findOne).toHaveBeenCalledWith(1);
      expect(eventsRepository.update).toHaveBeenCalledTimes(1);
      expect(commentRepository.delete).toHaveBeenCalledWith(1);
      expect(comment.event.commentsCount).toBe(0);
    });

    it('should throw COMMENT_NOT_FOUND if comment does not exist', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(null);

      await expect(commentService.deleteComment(1, member)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.COMMENT_NOT_FOUND),
      );
    });

    it('should throw COMMENT_NOT_MATCH if comment does not match', async () => {
      const anotherMember = new MemberBuilder().id(2).build();
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);

      await expect(
        commentService.deleteComment(1, anotherMember),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.COMMENT_NOT_MATCH));
    });

    it('should throw EVENT_NOT_FOUND if event does not exist', async () => {
      jest.spyOn(commentRepository, 'findOne').mockResolvedValue(comment);
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(null);

      await expect(commentService.deleteComment(1, member)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });
});

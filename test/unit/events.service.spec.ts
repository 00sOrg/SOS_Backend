import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/modules/events/events.service';
import { MembersRepository } from 'src/modules/members/members.repository';
import { EventsRepository } from 'src/modules/events/events.repository';
import { CreateEventRequestDto } from 'src/modules/events/dto/create-event.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Member } from 'src/modules/members/entities';
import { Event } from 'src/modules/events/entities';

describe('EventService', () => {
  let eventService: EventsService;
  let memberRepository: Partial<jest.Mocked<MembersRepository>>;
  let eventRepository: Partial<jest.Mocked<EventsRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: MembersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    eventService = module.get<EventsService>(EventsService);
    memberRepository = module.get(MembersRepository);
    eventRepository = module.get(EventsRepository);
  });

  it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
    memberRepository.findById.mockResolvedValue(null);

    const request: CreateEventRequestDto = {
      memberId: 1,
      title: 'Test',
      content: 'test',
      image: '',
      lat: 12.2304,
      lng: -34.34343,
    };

    await expect(eventService.create(request)).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
  });

  it('should throw EVENT_CONTENTS_NOT_FOUND if both image and content are empty', async () => {
    const member = new Member();
    memberRepository.findById.mockResolvedValue(member);

    const request: CreateEventRequestDto = {
      memberId: 1,
      title: 'Test Event',
      content: '',
      image: '',
      lat: 12.2304,
      lng: -34.34343,
    };

    await expect(eventService.create(request)).rejects.toThrow(new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND));
  });

  it('should create an event successfully', async () => {
    const member = new Member();
    const event = new Event();
    memberRepository.findById.mockResolvedValue(member);
    eventRepository.create.mockResolvedValue(event);

    const request: CreateEventRequestDto = {
      memberId: 1,
      title: 'Test Event',
      content: 'This is a test event',
      image: 'image_url',
      lat: 12.2304,
      lng: -34.34343,
    };

    await eventService.create(request);

    expect(memberRepository.findById).toHaveBeenCalledWith(1);
    expect(eventRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      member,
      title: 'Test Event',
      content: 'This is a test event',
      media: 'image_url',
      latitude: 12.2304,
      longitude: -34.34343,
    }));
  });

  it('should return the event successfully', async () => {
    const id = 1;
    const event = new Event();
    eventRepository.findById.mockResolvedValue(event);
    const result = await eventService.findOne(id);
    expect(eventRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(event);
    
  })

  it('should throw EVENT_NOT_FOUND if the event is not found', async () => {
    const id = 1;
    eventRepository.findById.mockResolvedValue(null);
    
    await expect(eventService.findOne(id)).rejects.toThrow(new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND));
  })

});
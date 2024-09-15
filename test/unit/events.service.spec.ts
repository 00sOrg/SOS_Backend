import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/modules/events/service/events.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { EventsRepository } from 'src/modules/events/repository/events.repository';
import { CreateEventDto } from 'src/modules/events/dto/create-event.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Member, MemberDetail } from 'src/modules/members/entities';
import { Event, Like } from 'src/modules/events/entities';
import { NaverService } from 'src/external/naver/naver.service';
import { S3Service } from 'src/external/s3/s3.service';
import { GetFeedsDto } from '../../src/modules/events/dto/get-feeds.dto';
import { MemberBuilder } from '../../src/modules/members/entities/builder/member.builder';
import { EventBuilder } from '../../src/modules/events/entities/builder/event.builder';
import { LikeRepository } from '../../src/modules/events/repository/like.repository';
import { LikeBuilder } from '../../src/modules/events/entities/builder/like.builder';
import { FindEventDto } from '../../src/modules/events/dto/find-event.dto';

describe('EventService', () => {
  let eventService: EventsService;
  let memberRepository: MembersRepository;
  let eventRepository: EventsRepository;
  let naverService: NaverService;
  let s3Service: S3Service;
  let likeRepository: LikeRepository;

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
            findNearby: jest.fn(),
            findNearbyAll: jest.fn(),
            findEventsOrderByLikes: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: NaverService,
          useValue: {
            getAddressFromCoordinate: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            upload: jest.fn(),
          },
        },
        {
          provide: LikeRepository,
          useValue: {
            create: jest.fn(),
            isLiked: jest.fn(),
          },
        },
      ],
    }).compile();

    eventService = module.get<EventsService>(EventsService);
    memberRepository = module.get(MembersRepository);
    eventRepository = module.get(EventsRepository);
    naverService = module.get<NaverService>(NaverService);
    s3Service = module.get<S3Service>(S3Service);
    likeRepository = module.get(LikeRepository);
  });

  describe('create', () => {
    let request: CreateEventDto;
    let member: Member;
    let media: Express.Multer.File;
    let event: Event;

    beforeEach(() => {
      media = { originalname: 'test.jpg', buffer: Buffer.from('test') } as any;

      request = Object.assign(new CreateEventDto(), {
        title: 'Test Event',
        content: 'This is a test event',
        lat: 12.2304,
        lng: -34.34343,
      });

      member = new Member();
      event = new Event();
    });

    it('should throw EVENT_CONTENTS_NOT_FOUND if both image and content are empty', async () => {
      request.content = '';
      await expect(eventService.create(request, member, null)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND),
      );
    });

    it('should create an event successfully', async () => {
      jest.spyOn(eventRepository, 'create').mockResolvedValue(event);

      await eventService.create(request, member, media);

      expect(s3Service.upload).toHaveBeenCalledWith(media);
      expect(eventRepository.create).toHaveBeenCalled();
    });
  });

  describe('fineOne', () => {
    let eventId: number;
    let memberId: number;
    let member: Member;
    let memberDetail: MemberDetail;
    let event: Event;
    let findEventDto: FindEventDto;
    beforeEach(() => {
      eventId = 1;
      memberId = 1;
      memberDetail = new MemberDetail();
      member = new MemberBuilder().memberDetail(memberDetail).build();
      event = new EventBuilder().member(member).build();
      findEventDto = FindEventDto.of(event, true);
    });

    it('should return the event successfully', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(event);
      jest.spyOn(likeRepository, 'isLiked').mockResolvedValue(true);

      const result = await eventService.findOne(eventId, memberId);

      expect(eventRepository.findById).toHaveBeenCalledWith(1);
      expect(likeRepository.isLiked).toHaveBeenCalledWith(eventId, memberId);
      expect(result).toEqual(findEventDto);
    });

    it('should throw EVENT_NOT_FOUND if the event is not found', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(null);

      await expect(eventService.findOne(eventId, memberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });

  describe('findNearby', () => {
    let lat: number;
    let lng: number;
    let level: string;
    let events: Event[];
    beforeEach(() => {
      level = 'primary';
      lat = 37.5665;
      lng = 126.978;
      events = [
        {
          id: 1,
          title: 'Event 1',
          latitude: 37.5665,
          longitude: 126.978,
          media: 'media1.jpg',
        } as Event,
        {
          id: 2,
          title: 'Event 2',
          latitude: 37.5651,
          longitude: 126.982,
          media: 'media2.jpg',
        } as Event,
        {
          id: 3,
          title: 'Event 3',
          latitude: 37.5643,
          longitude: 126.977,
          media: 'media3.jpg',
        } as Event,
      ];
    });
    it('should return the events nearby', async () => {
      jest.spyOn(eventRepository, 'findNearby').mockResolvedValue(events);
      const result = await eventService.findNearby(lat, lng, level);
      expect(result).toEqual(events);
    });
    it('should throw INVALID_GEO_LOCATION if the lat or lng is not valid', async () => {
      lat = 100.5665;
      lng = 186.978;
      await expect(eventService.findNearby(lat, lng, level)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION),
      );
    });
    it('should throw INVALID_DISASTER_LEVEL if invalid level is requested', async () => {
      level = 'wrong';
      await expect(eventService.findNearby(lat, lng, level)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_DISASTER_LEVEL),
      );
    });
  });
  describe('findNearbyAll', () => {
    let lat: number;
    let lng: number;
    let events: Event[];
    let address: string;
    beforeEach(() => {
      lat = 37.5665;
      lng = 126.978;
      events = [
        {
          id: 1,
          title: 'Event 1',
          latitude: 37.5665,
          longitude: 126.978,
          media: 'media1.jpg',
        } as Event,
        {
          id: 2,
          title: 'Event 2',
          latitude: 37.5651,
          longitude: 126.982,
          media: 'media2.jpg',
        } as Event,
        {
          id: 3,
          title: 'Event 3',
          latitude: 37.5643,
          longitude: 126.977,
          media: 'media3.jpg',
        } as Event,
      ];
      address = 'si gu dong';
    });
    it('should return all the events nearby', async () => {
      jest
        .spyOn(naverService, 'getAddressFromCoordinate')
        .mockResolvedValue(address);
      jest.spyOn(eventRepository, 'findNearbyAll').mockResolvedValue(events);
      const result = await eventService.findNearybyAll(lat, lng);
      result.events.forEach((event, index) => {
        expect(event.id).toEqual(events[index].id);
        expect(event.title).toEqual(events[index].title);
        expect(event.media).toEqual(events[index].media);
        expect(event.createdAt).toEqual(events[index].createdAt);
      });
      expect(result.eventsNumber).toEqual(events.length);
    });
    it('should throw INVALID_GEO_LOCATION if the lat or lng is not valid', async () => {
      lat = 100.5665;
      lng = 186.978;
      await expect(eventService.findNearybyAll(lat, lng)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION),
      );
    });
  });

  describe('getFeeds', () => {
    let events: Event[];
    let getFeedDto: GetFeedsDto;

    beforeEach(() => {
      events = [
        {
          id: 1,
          title: 'Event 1',
          content: 'Content 1',
          likesCount: 20,
        } as Event,
        {
          id: 2,
          title: 'Event 2',
          content: 'Content 2',
          likesCount: 10,
        } as Event,
        {
          id: 3,
          title: 'Event 3',
          content: 'Content 3',
          likesCount: 5,
        } as Event,
      ];
      getFeedDto = GetFeedsDto.of(events);
    });
    it('should return feeds ordered by likes', async () => {
      jest
        .spyOn(eventRepository, 'findEventsOrderByLikes')
        .mockResolvedValue(events);
      const result = await eventService.getFeeds();
      expect(eventRepository.findEventsOrderByLikes).toHaveBeenCalledTimes(1);
      expect(result.events[0].eventId).toEqual(1);
      expect(result).toEqual(getFeedDto);
    });
  });

  describe('likeEvent', () => {
    let member: Member;
    let event: Event;
    let like: Like;
    beforeEach(() => {
      member = new MemberBuilder().id(1).build();
      event = new EventBuilder().id(1).build();
      like = new LikeBuilder().event(event).member(member).build();
    });
    it('should like the event successfully', async () => {
      const memberId = 1;
      const eventId = 1;

      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event);
      jest.spyOn(likeRepository, 'isLiked').mockResolvedValue(false);

      await eventService.likeEvent(eventId, memberId);
      expect(memberRepository.findById).toHaveBeenCalledWith(memberId);
      expect(eventRepository.findOne).toHaveBeenCalledWith(eventId);
      expect(likeRepository.isLiked).toHaveBeenCalledWith(eventId, memberId);
      expect(eventRepository.update).toHaveBeenCalledWith(event);
      expect(likeRepository.create).toHaveBeenCalledWith(like);
    });
    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      const memberId = 1;
      const eventId = 1;
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(null);
      await expect(eventService.likeEvent(eventId, memberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND),
      );
    });

    it('should throw EVENT_NOT_FOUND if event does not exist', async () => {
      const memberId = 1;
      const eventId = 1;
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);
      await expect(eventService.likeEvent(eventId, memberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });

    it('should throw EVENT_ALREADY_LIKED if isLiked is true', async () => {
      const memberId = 1;
      const eventId = 1;
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(event);
      jest.spyOn(likeRepository, 'isLiked').mockResolvedValue(true);
      await expect(eventService.likeEvent(eventId, memberId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_ALREADY_LIKED),
      );
    });
  });
});

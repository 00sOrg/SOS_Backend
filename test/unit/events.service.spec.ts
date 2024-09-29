import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/modules/events/services/events.service';
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
import { SearchEventDto } from '../../src/modules/events/dto/search-event.dto';
import { EventType } from '../../src/modules/events/entities/enum/event-type.enum';
import { DisasterLevel } from '../../src/modules/events/entities/enum/disaster-level.enum';
import { FindEventOverviewDto } from '../../src/modules/events/dto/find-event-overview.dto';
import { MembersService } from '../../src/modules/members/services/members.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KeywordRepository } from '../../src/modules/events/repository/keyword.repository';
import { Keyword } from '../../src/modules/events/entities/keyword.entity';
import { KeywordBuilder } from '../../src/modules/events/entities/builder/keyword.builder';
import { GetEventsDto } from '../../src/modules/events/dto/get-events.dto';
import { MemberDetailBuilder } from 'src/modules/members/entities/builder/memberDetail.builder';

describe('EventService', () => {
  let eventsService: EventsService;
  let eventsRepository: EventsRepository;
  let naverService: NaverService;
  let s3Service: S3Service;
  let likeRepository: LikeRepository;
  let memberService: MembersService;
  let eventEmitter: EventEmitter2;
  let keywordRepository: KeywordRepository;

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
            findByTitleLike: jest.fn(),
            findAllByMember: jest.fn(),
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
            findByEventAndMember: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: MembersService,
          useValue: {
            findNearbyAndFavoritingMembers: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: KeywordRepository,
          useValue: {
            createKeywords: jest.fn(),
          },
        },
      ],
    }).compile();

    eventsService = module.get<EventsService>(EventsService);
    eventsRepository = module.get(EventsRepository);
    naverService = module.get<NaverService>(NaverService);
    s3Service = module.get<S3Service>(S3Service);
    likeRepository = module.get(LikeRepository);
    memberService = module.get(MembersService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    keywordRepository = module.get(KeywordRepository);
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
      await expect(eventsService.create(request, member, null)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND),
      );
    });

    it('should create an event successfully', async () => {
      jest.spyOn(eventsRepository, 'create').mockResolvedValue(event);

      await eventsService.create(request, member, media);

      expect(s3Service.upload).toHaveBeenCalledWith(media);
      expect(eventsRepository.create).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith('openai.keywords', {
        content: request.content,
        event: event,
      });
    });
  });

  describe('fineOne', () => {
    let eventId: number;
    let member: Member;
    let memberDetail: MemberDetail;
    let keyword: Keyword;
    let event: Event;
    let findEventDto: FindEventDto;
    let like: Like;
    beforeEach(() => {
      eventId = 1;
      memberDetail = new MemberDetail();
      member = new MemberBuilder().id(1).memberDetail(memberDetail).build();
      keyword = new KeywordBuilder()
        .id(1)
        .keyword('keyword')
        .event(event)
        .build();
      event = new EventBuilder().member(member).build();
      event.keywords = [keyword];
      like = new LikeBuilder().build();
      findEventDto = FindEventDto.of(event, true);
    });

    it('should return the event successfully', async () => {
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(event);
      jest
        .spyOn(likeRepository, 'findByEventAndMember')
        .mockResolvedValue(like);

      const result = await eventsService.findOne(eventId, member);

      expect(eventsRepository.findById).toHaveBeenCalledWith(1);
      expect(likeRepository.findByEventAndMember).toHaveBeenCalledWith(
        eventId,
        member.id,
      );
      expect(result).toEqual(findEventDto);
    });

    it('should throw EVENT_NOT_FOUND if the event is not found', async () => {
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(null);

      await expect(eventsService.findOne(eventId, member)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });
  describe('findOneOverview', () => {
    let eventId: number;
    let keyword: Keyword;
    let event: Event;
    let member: Member;
    let memberDetail: MemberDetail;

    beforeEach(() => {
      eventId = 1;

      memberDetail = new MemberDetailBuilder()
        .id(1)
        .profilePicture('profile-picture-url')
        .build();

      member = new MemberBuilder()
        .id(1)
        .nickname('memberNickname')
        .memberDetail(memberDetail)
        .build();

      keyword = new KeywordBuilder()
        .id(1)
        .keyword('keyword')
        .event(event)
        .build();

      event = new EventBuilder()
        .id(1)
        .title('title')
        .content('content')
        .media('media')
        .type(EventType.NONE)
        .disasterLevel(DisasterLevel.SECONDARY)
        .member(member) // member 객체 추가
        .address('Seoul, Korea')
        .build();

      event.keywords = [keyword];
    });

    it('should return the overview of event successfully', async () => {
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(event);
      const result = await eventsService.findOneOverview(eventId);

      expect(result).toBeInstanceOf(FindEventOverviewDto);
      expect(result.id).toEqual(event.id);
      expect(result.title).toEqual(event.title);
      expect(result.memberNickname).toEqual(member.nickname); // memberNickname 테스트
      expect(result.memberProfile).toEqual(memberDetail.profilePicture); // memberProfile 테스트
      expect(result.address).toEqual(event.address); // address 테스트
      expect(result.keywords).toEqual(event.keywords?.map((k) => k.keyword));

      expect(eventsRepository.findById).toHaveBeenCalledWith(eventId);
    });

    it('should throw EVENT_NOT_FOUND if the event is not found', async () => {
      jest.spyOn(eventsRepository, 'findById').mockResolvedValue(null);

      await expect(eventsService.findOneOverview(eventId)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });

  describe('findNearby', () => {
    let lat: number;
    let lng: number;
    let level: string;
    let zoom: number;
    let events: Event[];
    beforeEach(() => {
      level = 'primary';
      lat = 37.5665;
      lng = 126.978;
      zoom = 15;
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
      jest.spyOn(eventsRepository, 'findNearby').mockResolvedValue(events);
      const result = await eventsService.findNearby(lat, lng, level, zoom);
      expect(result).toEqual(events);
    });
    it('should throw INVALID_GEO_LOCATION if the lat or lng is not valid', async () => {
      lat = 100.5665;
      lng = 186.978;
      await expect(
        eventsService.findNearby(lat, lng, level, zoom),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION));
    });
    it('should throw INVALID_DISASTER_LEVEL if invalid level is requested', async () => {
      level = 'wrong';
      await expect(
        eventsService.findNearby(lat, lng, level, zoom),
      ).rejects.toThrow(
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
      jest.spyOn(eventsRepository, 'findNearbyAll').mockResolvedValue(events);
      const result = await eventsService.findNearbyAll(lat, lng);
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
      await expect(eventsService.findNearbyAll(lat, lng)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION),
      );
    });
  });

  describe('getFeeds', () => {
    let events: Event[];
    let getFeedDto: GetFeedsDto;

    beforeEach(() => {
      const event1 = new EventBuilder().id(1).build();
      const event2 = new EventBuilder().id(2).build();
      const event3 = new EventBuilder().id(3).build();
      event1.keywords = [];
      event2.keywords = [];
      event3.keywords = [];

      events = [event1, event2, event3];
      getFeedDto = GetFeedsDto.of(events);
    });
    it('should return feeds ordered by likes', async () => {
      jest
        .spyOn(eventsRepository, 'findEventsOrderByLikes')
        .mockResolvedValue(events);
      const result = await eventsService.getFeeds();
      expect(eventsRepository.findEventsOrderByLikes).toHaveBeenCalledTimes(1);
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
      event = new EventBuilder().id(1).likesCount(1).build();
      like = new LikeBuilder().event(event).member(member).build();
    });
    it('should like the event successfully', async () => {
      const eventId = 1;

      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(event);
      jest
        .spyOn(likeRepository, 'findByEventAndMember')
        .mockResolvedValue(null);
      jest.spyOn(likeRepository, 'create').mockResolvedValue(like);
      jest.spyOn(eventsRepository, 'update').mockResolvedValue(undefined);

      const result = await eventsService.likeEvent(eventId, member);

      expect(eventsRepository.findOne).toHaveBeenCalledWith(eventId);
      expect(likeRepository.findByEventAndMember).toHaveBeenCalledWith(
        eventId,
        member.id,
      );
      expect(likeRepository.create).toHaveBeenCalledWith(expect.any(Like));
      expect(event.likesCount).toBe(2);
      expect(eventsRepository.update).toHaveBeenCalledWith(event);
      expect(result.isLiked).toBe(true);
    });

    it('should cancel like successfully if the event is already liked', async () => {
      const eventId = 1;

      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(event);
      jest
        .spyOn(likeRepository, 'findByEventAndMember')
        .mockResolvedValue(like);
      jest.spyOn(likeRepository, 'delete').mockResolvedValue(undefined);
      jest.spyOn(eventsRepository, 'update').mockResolvedValue(undefined);

      const result = await eventsService.likeEvent(eventId, member);

      expect(likeRepository.findByEventAndMember).toHaveBeenCalledWith(
        eventId,
        member.id,
      );
      expect(likeRepository.delete).toHaveBeenCalledWith(like);
      expect(eventsRepository.update).toHaveBeenCalledWith(event);
      expect(result.isLiked).toBe(false);
    });

    it('should throw EVENT_NOT_FOUND if event does not exist', async () => {
      const eventId = 1;
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(null);
      await expect(eventsService.likeEvent(eventId, member)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });

  describe('searchEvent', () => {
    it('should return search results successfully', async () => {
      const keyword = 'test';
      const events = [
        new EventBuilder().title('test event 1').build(),
        new EventBuilder().title('test event 2').build(),
      ];
      const searchEventDto = SearchEventDto.of(events);
      jest.spyOn(eventsRepository, 'findByTitleLike').mockResolvedValue(events);
      const result = await eventsService.searchEvent(keyword);

      expect(eventsRepository.findByTitleLike).toHaveBeenCalledWith(keyword);
      expect(result).toEqual(searchEventDto);
    });
  });

  describe('createPrimary', () => {
    it('should create an event and emit notifications', async () => {
      const request = new CreateEventDto();
      const member = new MemberBuilder().id(1).logitude(0).logitude(0).build();
      const media = null;
      const newEvent = new EventBuilder()
        .id(1)
        .disasterLevel(DisasterLevel.PRIMARY)
        .build();
      const members = [{ id: 2 }] as Member[];

      jest.spyOn(s3Service, 'upload').mockResolvedValue('uploaded-url');
      jest.spyOn(eventsRepository, 'create').mockResolvedValue(newEvent);
      jest
        .spyOn(memberService, 'findNearbyAndFavoritingMembers')
        .mockResolvedValue(members);

      await eventsService.createPrimary(request, member, media);

      expect(s3Service.upload).not.toHaveBeenCalled();
      expect(eventsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          disasterLevel: DisasterLevel.PRIMARY,
        }),
      );
      expect(memberService.findNearbyAndFavoritingMembers).toHaveBeenCalledWith(
        request.latitude,
        request.longitude,
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(3);
      expect(eventEmitter.emit).toHaveBeenCalledWith('notify.nearby', {
        members,
        eventId: newEvent.id,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('notify.friends', {
        members,
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('openai.keywords', {
        content: request.content,
        event: newEvent,
      });
    });
  });

  describe('createKeywords', () => {
    it('should properly create keywords and call the repository', async () => {
      const event = new Event();
      const words = ['keyword1', 'keyword2', 'keyword3'];
      jest
        .spyOn(keywordRepository, 'createKeywords')
        .mockResolvedValue(undefined);

      await eventsService.createKeywords(event, words);

      expect(keywordRepository.createKeywords).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEvents', () => {
    it('should return GetEventsDto successfully', async () => {
      const member = new MemberBuilder().id(1).build();
      const events = [
        new EventBuilder().id(1).build(),
        new EventBuilder().id(2).build(),
      ];
      const getEventsDto = GetEventsDto.of(events);
      jest.spyOn(eventsRepository, 'findAllByMember').mockResolvedValue(events);

      const result = await eventsService.getEvents(member);

      expect(eventsRepository.findAllByMember).toHaveBeenCalledWith(member.id);
      expect(result).toEqual(getEventsDto);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from 'src/modules/events/service/events.service';
import { MembersRepository } from 'src/modules/members/repository/members.repository';
import { EventsRepository } from 'src/modules/events/repository/events.repository';
import { CreateEventDto } from 'src/modules/events/dto/create-event.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Member } from 'src/modules/members/entities';
import { Event } from 'src/modules/events/entities';
import { NaverService } from 'src/external/naver/naver.service';
import { S3Service } from 'src/external/s3/s3.service';

describe('EventService', () => {
  let eventService: EventsService;
  let memberRepository: MembersRepository;
  let eventRepository: EventsRepository;
  let naverService: NaverService;
  let s3Service: S3Service;

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
      ],
    }).compile();

    eventService = module.get<EventsService>(EventsService);
    memberRepository = module.get(MembersRepository);
    eventRepository = module.get(EventsRepository);
    naverService = module.get<NaverService>(NaverService);
    s3Service = module.get<S3Service>(S3Service);
  });

  describe('create', () => {
    let request: CreateEventDto;
    let member: Member;
    let memberId: number;
    let media: Express.Multer.File;
    let region: any;
    let event: Event;

    beforeEach(() => {
      memberId = 1;
      media = { originalname: 'test.jpg', buffer: Buffer.from('test') } as any;

      request = Object.assign(new CreateEventDto(), {
        title: 'Test Event',
        content: 'This is a test event',
        lat: 12.2304,
        lng: -34.34343,
      });

      member = new Member();
      event = new Event();
      region = { city: 'Seoul', gu: 'gu', dong: 'dong' };
    });
    it('should throw MEMBER_NOT_FOUND if member does not exist', async () => {
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(null);
      await expect(
        eventService.create(request, memberId, media),
      ).rejects.toThrow(new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND));
    });

    it('should throw EVENT_CONTENTS_NOT_FOUND if both image and content are empty', async () => {
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      request.content = '';
      await expect(
        eventService.create(request, memberId, null),
      ).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND),
      );
    });

    it('should create an event successfully', async () => {
      jest.spyOn(memberRepository, 'findById').mockResolvedValue(member);
      jest.spyOn(eventRepository, 'create').mockResolvedValue(event);
      jest
        .spyOn(naverService, 'getAddressFromCoordinate')
        .mockResolvedValue(region);
      jest.spyOn(s3Service, 'upload').mockResolvedValue(null);

      await eventService.create(request, memberId, media);

      expect(memberRepository.findById).toHaveBeenCalledWith(memberId);
      expect(s3Service.upload).toHaveBeenCalledWith(media);
      expect(naverService.getAddressFromCoordinate).toHaveBeenCalledWith(
        request.lat,
        request.lng,
      );
      expect(eventRepository.create).toHaveBeenCalled();
    });
  });

  describe('fineOne', () => {
    let id: number;
    let event: Event;
    beforeEach(() => {
      id = 1;
      event = new Event();
    });

    it('should return the event successfully', async () => {
      jest.spyOn(eventRepository, 'findById').mockResolvedValue(event);

      const result = await eventService.findOne(id);
      expect(eventRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toBe(event);
    });

    it('should throw EVENT_NOT_FOUND if the event is not found', async () => {
      jest.spyOn(eventRepository, 'create').mockResolvedValue(null);

      await expect(eventService.findOne(id)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND),
      );
    });
  });

  describe('findNearby', () => {
    let lat: number;
    let lng: number;
    let events: Event[];
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
    });
    it('should retrun the events nearby', async () => {
      jest.spyOn(eventRepository, 'findNearby').mockResolvedValue(events);
      const result = await eventService.findNearby(lat, lng);
      expect(result).toEqual(events);
    });
    it('should throw INVALID_GEO_LOCATION if the lat or lng is not valid', async () => {
      lat = 100.5665;
      lng = 186.978;
      await expect(eventService.findNearby(lat, lng)).rejects.toThrow(
        new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION),
      );
    });
  });
});

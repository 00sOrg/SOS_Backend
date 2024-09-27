import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Event } from '../entities';
import { NaverService } from 'src/external/naver/naver.service';
import { S3Service } from 'src/external/s3/s3.service';
import { FindNearbyAllDto } from '../dto/find-nearby-all.dto';
import { GetFeedsDto } from '../dto/get-feeds.dto';
import { LikeRepository } from '../repository/like.repository';
import { LikeBuilder } from '../entities/builder/like.builder';
import { FindEventDto } from '../dto/find-event.dto';
import { Member } from '../../members/entities';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';
import { LikeEventDto } from '../dto/like-event.dto';
import { SearchEventDto } from '../dto/search-event.dto';
import { MembersService } from '../../members/services/members.service';
import { FindEventOverviewDto } from '../dto/find-event-overview.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KeywordBuilder } from '../entities/builder/keyword.builder';
import { KeywordRepository } from '../repository/keyword.repository';
import { GetEventsDto } from '../dto/get-events.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly naverService: NaverService,
    private readonly s3Service: S3Service,
    private readonly likeRepository: LikeRepository,
    private readonly memberService: MembersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly keywordRepository: KeywordRepository,
  ) {}

  async create(
    request: CreateEventDto,
    member: Member,
    media: Express.Multer.File | null,
  ): Promise<void> {
    if (!request.content && !media) {
      throw new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND);
    }
    const url = media ? await this.s3Service.upload(media) : undefined;
    const event = request.toEvent(member, url);
    const newEvent = await this.eventsRepository.create(event);
    this.eventEmitter.emit('openai.keywords', {
      content: request.content,
      event: newEvent,
    });
  }

  async findOne(eventId: number, member: Member): Promise<FindEventDto> {
    const event = await this.eventsRepository.findById(eventId);
    const like = await this.likeRepository.findByEventAndMember(
      eventId,
      member.id,
    );
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    const isLiked = like ? true : false;
    return FindEventDto.of(event, isLiked);
  }

  async findOneOverview(eventId: number): Promise<FindEventOverviewDto> {
    const event = await this.eventsRepository.findById(eventId);
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    return FindEventOverviewDto.of(event);
  }

  async findNearby(
    lat: number,
    lng: number,
    level: string,
    zoom: number,
  ): Promise<Event[]> {
    this.isValidLocation(lat, lng);
    if (!(level.toUpperCase() in DisasterLevel)) {
      throw new ExceptionHandler(ErrorStatus.INVALID_DISASTER_LEVEL);
    }
    const bound = this.calculateBound(lat, lng, zoom);
    return await this.eventsRepository.findNearby(
      bound.minLat,
      bound.maxLat,
      bound.minLng,
      bound.maxLng,
      level,
    );
  }

  async findNearbyAll(lat: number, lng: number): Promise<FindNearbyAllDto> {
    this.isValidLocation(lat, lng);
    const address = await this.naverService.getAddressFromCoordinate(lat, lng);
    const events: Event[] = await this.eventsRepository.findNearbyAll(address);
    return FindNearbyAllDto.of(events);
  }

  async getFeeds(): Promise<GetFeedsDto> {
    const events = await this.eventsRepository.findEventsOrderByLikes();
    return GetFeedsDto.of(events);
  }

  async likeEvent(eventId: number, member: Member): Promise<LikeEventDto> {
    const event = await this.eventsRepository.findOne(eventId);
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    const like = await this.likeRepository.findByEventAndMember(
      eventId,
      member.id,
    );
    if (like) {
      await this.likeRepository.delete(like);
      event.removeLikeCount();
    } else {
      const newLike = new LikeBuilder().event(event).member(member).build();
      await this.likeRepository.create(newLike);
      event.addLikeCount();
    }
    await this.eventsRepository.update(event);
    return LikeEventDto.of(like ? false : true);
  }

  async searchEvent(keyword: string): Promise<SearchEventDto> {
    const events = await this.eventsRepository.findByTitleLike(keyword);
    return SearchEventDto.of(events);
  }
  async createPrimary(
    request: CreateEventDto,
    member: Member,
    media: Express.Multer.File | null,
  ) {
    const url = media ? await this.s3Service.upload(media) : undefined;
    const event = request.toEvent(member, url);
    event.disasterLevel = DisasterLevel.PRIMARY;
    const newEvent = await this.eventsRepository.create(event);

    const members = await this.memberService.findNearbyAndFavoritingMembers(
      request.latitude,
      request.longitude,
    );
    this.eventEmitter.emit('notify.nearby', {
      members: members,
      eventId: newEvent.id,
    });
    this.eventEmitter.emit('notify.friends', {
      members: members,
    });
    this.eventEmitter.emit('openai.keywords', {
      content: request.content,
      event: newEvent,
    });
  }
  async createKeywords(event: Event, words: string[]) {
    const keywords = words.map((word) => {
      return new KeywordBuilder().keyword(word).event(event).build();
    });
    await this.keywordRepository.createKeywords(keywords);
  }

  async getEvents(member: Member): Promise<GetEventsDto> {
    const events = await this.eventsRepository.findAllByMember(member.id);
    return GetEventsDto.of(events);
  }

  private isValidLocation(lat: number, lng: number) {
    if (
      lat === undefined ||
      lat === null ||
      lat < -90 ||
      lat > 90 ||
      lng === undefined ||
      lng === null ||
      lng < -180 ||
      lng > 180
    ) {
      throw new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION);
    }
  }

  private calculateBound(lat: number, lng: number, zoom: number) {
    const earthRadius = 6371000;
    const distanceMap = {
      15: 800,
      14: 1600,
      13: 3200,
      12: 6400,
      11: 12800,
      10: 25600,
    };

    const adjustedZoom = Math.max(10, Math.min(15, zoom));
    const lngDistance = distanceMap[adjustedZoom];
    const latDistance = lngDistance * 2;

    const deltaLat = (latDistance / earthRadius) * (180 / Math.PI);
    const maxLat = lat + deltaLat;
    const minLat = lat - deltaLat;

    const deltaLng =
      (lngDistance / (earthRadius * Math.cos((Math.PI * lat) / 180))) *
      (180 / Math.PI);
    const maxLng = lng + deltaLng;
    const minLng = lng - deltaLng;
    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
    };
  }
}

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
import { NotificationType } from '../../alarm/entities/enums/notificationType.enum';
import { FindEventOverviewDto } from '../dto/find-event-overview.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly naverService: NaverService,
    private readonly s3Service: S3Service,
    private readonly likeRepository: LikeRepository,
    private readonly memberService: MembersService,
    private readonly eventEmitter: EventEmitter2,
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
    await this.eventsRepository.create(event);
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

  async findNearby(lat: number, lng: number, level: string): Promise<Event[]> {
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
    if (!(level.toUpperCase() in DisasterLevel)) {
      throw new ExceptionHandler(ErrorStatus.INVALID_DISASTER_LEVEL);
    }
    const earthRadius = 6371000;
    const latDistance = 200 / earthRadius;
    const lngDistance = 200 / (earthRadius * Math.cos((Math.PI * lat) / 180));

    const minLat = lat - (latDistance * 180) / Math.PI;
    const maxLat = lat + (latDistance * 180) / Math.PI;
    const minLng = lng - (lngDistance * 180) / Math.PI;
    const maxLng = lng + (lngDistance * 180) / Math.PI;

    return await this.eventsRepository.findNearby(
      minLat,
      maxLat,
      minLng,
      maxLng,
      level,
    );
  }

  async findNearbyAll(lat: number, lng: number): Promise<FindNearbyAllDto> {
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
  }
}

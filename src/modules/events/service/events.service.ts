import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { MembersRepository } from '../../members/repository/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Event } from '../entities';
import { NaverService } from 'src/external/naver/naver.service';
import { S3Service } from 'src/external/s3/s3.service';
import { Region } from '../../../external/naver/dto/region.dto';
import { FindNearbyAllDto } from '../dto/find-nearby-all.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly naverService: NaverService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    request: CreateEventDto,
    memberId: number,
    media: Express.Multer.File | null,
  ): Promise<void> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    if (!request.content && !media) {
      throw new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND);
    }
    const url = media ? await this.s3Service.upload(media) : undefined;
    const region = await this.naverService.getAddressFromCoordinate(
      request.latitude,
      request.longitude,
    );
    const event = request.toEvent(region, member, url);
    await this.eventsRepository.create(event);
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    return event;
  }

  async findNearby(lat: number, lng: number): Promise<Event[]> {
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION);
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
    );
  }

  async findNearybyAll(lat: number, lng: number): Promise<FindNearbyAllDto> {
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION);
    }
    const region: Region = await this.naverService.getAddressFromCoordinate(
      lat,
      lng,
    );
    const events: Event[] = await this.eventsRepository.findNearbyAll(region);
    return FindNearbyAllDto.of(events, region);
  }
}

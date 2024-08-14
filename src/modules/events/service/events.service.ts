import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { MembersRepository } from '../../members/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Event } from '../entities';
import { NaverService } from 'src/external/naver/naver.service';
import { S3Service } from 'src/external/s3/s3.service';

@Injectable()
export class EventsService {

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly membersRepository: MembersRepository,
    private readonly naverService: NaverService,
    private readonly s3Service: S3Service,
  ){}

  async create(request: CreateEventDto, memberId: number, media: Express.Multer.File): Promise<void> {
    const member = await this.membersRepository.findById(memberId);
    if(!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    if(!request.content && !media) {
      throw new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND);
    }
    const url = media ? await this.s3Service.upload(media) : null;
    const region = await this.naverService.getAddressFromCoordinate(request.lat, request.lng);
    const event = request.toEvent(region, member, url);
    await this.eventsRepository.create(event);
  }

  findAll() {
    return `This action returns all events`;
  }

  async findOne(id: number) : Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if(!event) {
      throw new ExceptionHandler(ErrorStatus.EVENT_NOT_FOUND);
    }
    return event;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}

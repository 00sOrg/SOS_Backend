import { Injectable } from '@nestjs/common';
import { CreateEventRequestDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsRepository } from './events.repository';
import { Event } from './entities';
import { EventType } from './enum/event-type.enum';
import { MembersRepository } from '../members/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class EventsService {

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly membersRepository: MembersRepository,
  ){}

  async create(request: CreateEventRequestDto): Promise<void> {
    const member = await this.membersRepository.findById(request.memberId);
    if(!member) throw new ExceptionHandler(ErrorStatus.MEBER_NOT_FOUND);
    if(!request.image && !request.content) throw new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND);
    const event = new Event();
    event.member = member;
    event.title = request.title;
    event.content = request.content;
    event.media = request.image;
    event.latitude = request.lat;
    event.longitude = request.lng;
    await this.eventsRepository.create(event);
  }

  findAll() {
    return `This action returns all events`;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}

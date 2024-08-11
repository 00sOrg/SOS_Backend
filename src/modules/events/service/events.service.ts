import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventsRepository } from '../repository/events.repository';
import { EventType } from '../enum/event-type.enum';
import { MembersRepository } from '../../members/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { Event } from '../entities';
import { EventBuilder } from '../entities/builder/event.builder';

@Injectable()
export class EventsService {

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly membersRepository: MembersRepository,
  ){}

  async create(request: CreateEventDto, memberId: number): Promise<void> {
    const member = await this.membersRepository.findById(memberId);
    if(!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    if(!request.image && !request.content) {
      throw new ExceptionHandler(ErrorStatus.EVENT_CONTENTS_NOT_FOUND);
    }
    const event = request.toEvent();
    event.member = member;
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

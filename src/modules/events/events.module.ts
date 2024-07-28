import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { MembersRepository } from '../members/members.repository';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, MembersRepository],
})
export class EventsModule {}

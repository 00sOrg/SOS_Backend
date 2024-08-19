import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event } from '../entities';

@Injectable()
export class EventsRepository {
  private eventRepository: Repository<Event>;
  constructor(private readonly dataSource: DataSource) {
    this.eventRepository = this.dataSource.getRepository(Event);
  }

  async create(event: Event): Promise<Event> {
    return this.eventRepository.save(event);
  }

  async findById(eventId: number): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: {
        id: eventId,
      },
    });
  }

  async findNearby(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.latitude between :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('event.longitude between :minLng AND :maxLng', {
        minLng,
        maxLng,
      })
      .andWhere('event.createdAt > :yesterday', { yesterday })
      .getMany();
  }
}

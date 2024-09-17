import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event } from '../entities';
import { Region } from '../../../external/naver/dto/region.dto';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';

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
    return this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.member', 'eventMember')
      .leftJoinAndSelect('eventMember.memberDetail', 'eventMemberDetail')
      .leftJoinAndSelect('event.comments', 'comment')
      .leftJoinAndSelect('comment.member', 'commentMember')
      .leftJoinAndSelect('commentMember.memberDetail', 'commentMemberDetail')
      .where('event.id=:eventId', { eventId })
      .getOne();
  }

  async findNearby(
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
    level: string,
  ) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const query = this.eventRepository
      .createQueryBuilder('event')
      .where('event.latitude between :minLat AND :maxLat', { minLat, maxLat })
      .andWhere('event.longitude between :minLng AND :maxLng', {
        minLng,
        maxLng,
      })
      .andWhere('event.createdAt > :yesterday', { yesterday });

    if (
      level.toUpperCase() === DisasterLevel.PRIMARY ||
      level.toUpperCase() === DisasterLevel.SECONDARY
    ) {
      query.andWhere('event.disasterLevel = :level', { level });
    }

    return query.getMany();
  }

  async findNearbyAll(address: string): Promise<Event[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.address = :address', { address })
      .andWhere('event.createdAt > :yesterday', { yesterday })
      .addOrderBy('event.likesCount', 'DESC')
      .getMany();
  }

  async findEventsOrderByLikes(): Promise<Event[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.createdAt > :yesterday', { yesterday })
      .addOrderBy('event.likesCount', 'DESC')
      .getMany();
  }

  async update(event: Partial<Event>): Promise<void> {
    await this.eventRepository.update({ id: event.id }, { ...event });
  }

  async findOne(eventId: number): Promise<Event | null> {
    return this.eventRepository.findOne({ where: { id: eventId } });
  }

  async findByTitleLike(keyword: string): Promise<Event[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .where('event.title LIKE :keyword', { keyword: `%${keyword}%` })
      .getMany();
  }
}

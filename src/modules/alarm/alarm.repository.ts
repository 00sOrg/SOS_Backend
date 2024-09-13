import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class AlarmRepository {
  private readonly alarmRepository: Repository<Notification>;
  constructor(private readonly dataSource: DataSource) {
    this.alarmRepository = this.dataSource.getRepository(Notification);
  }

  async create(notification: Notification): Promise<Notification> {
    return this.alarmRepository.save(notification);
  }

  async createNotifications(notifications: Notification[]) {
    return this.alarmRepository.save(notifications);
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationRepository {
  private readonly notificationRepository: Repository<Notification>;
  constructor(private readonly dataSource: DataSource) {
    this.notificationRepository = this.dataSource.getRepository(Notification);
  }

  async create(notification: Notification): Promise<Notification> {
    return this.notificationRepository.save(notification);
  }

  async createNotifications(notifications: Notification[]): Promise<void> {
    await this.notificationRepository.save(notifications);
  }

  async getNotificationsByMember(memberId: number): Promise<Notification[]> {
    return (
      this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.member.id = :memberId', { memberId })
        // .andWhere('notification.isRead = false')
        .addOrderBy('notification.createdAt', 'DESC')
        .getMany()
    );
  }

  async markAsRead(notificationId: number, memberId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder('notification')
      .update()
      .set({ isRead: true })
      .where('notification.id=:notificationId', { notificationId })
      .andWhere('notification.memberId=:memberId', { memberId })
      .execute();
  }

  async deleteFavoriteNotification(favoriteId: number): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder('notification')
      .delete()
      .where("notification.referenceTable = 'favorite'")
      .andWhere('notification.referenceId = :favoriteId', { favoriteId })
      .execute();
  }
}

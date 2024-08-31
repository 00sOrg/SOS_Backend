import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities';
import e from 'express';

@Injectable()
export class LikeRepository {
  private likeRepository: Repository<Like>;
  constructor(private readonly dataSource: DataSource) {
    this.likeRepository = this.dataSource.getRepository(Like);
  }

  async create(like: Like): Promise<Like> {
    return this.likeRepository.save(like);
  }

  async isLiked(eventId: number, memberId: number): Promise<boolean> {
    const result = await this.likeRepository.findOne({
      where: {
        member: { id: memberId },
        event: { id: eventId },
      },
    });
    return result ? true : false;
  }
}

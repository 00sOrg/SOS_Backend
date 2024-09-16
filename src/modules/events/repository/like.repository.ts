import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Like } from '../entities';

@Injectable()
export class LikeRepository {
  private likeRepository: Repository<Like>;
  constructor(private readonly dataSource: DataSource) {
    this.likeRepository = this.dataSource.getRepository(Like);
  }

  async create(like: Like): Promise<Like> {
    return this.likeRepository.save(like);
  }

  async findByEventAndMember(
    eventId: number,
    memberId: number,
  ): Promise<Like | null> {
    return await this.likeRepository.findOne({
      where: {
        member: { id: memberId },
        event: { id: eventId },
      },
    });
  }

  async delete(like: Like): Promise<void> {
    await this.likeRepository.remove(like);
  }
}

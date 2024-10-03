import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Comment } from '../entities';

@Injectable()
export class CommentRepository {
  private commentRepository: Repository<Comment>;
  constructor(private readonly dataSource: DataSource) {
    this.commentRepository = this.dataSource.getRepository(Comment);
  }

  async create(comment: Comment): Promise<Comment> {
    return this.commentRepository.save(comment);
  }

  async findOne(commentId: number): Promise<Comment | null> {
    return this.commentRepository
      .createQueryBuilder('comment')
      .where('comment.id=:commentId', { commentId })
      .leftJoinAndSelect('comment.member', 'member')
      .leftJoinAndSelect('comment.event', 'event')
      .getOne();
  }

  async delete(commentId: number): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MemberDetail } from '../entities';

@Injectable()
export class MembersDetailRepository {
  private memberDetailRepository: Repository<MemberDetail>;

  constructor(private readonly dataSource: DataSource) {
    this.memberDetailRepository = this.dataSource.getRepository(MemberDetail);
  }

  async save(memberDetail: MemberDetail): Promise<MemberDetail> {
    return this.memberDetailRepository.save(memberDetail);
  }

  async update(
    memberId: number,
    updateData: Partial<MemberDetail>,
  ): Promise<void> {
    await this.memberDetailRepository.update(
      { member: { id: memberId } },
      updateData,
    );
  }

  async findByMemberId(memberId: number): Promise<MemberDetail | null> {
    return this.memberDetailRepository
      .createQueryBuilder('memberDetail')
      .where('memberDetail.memberId = :memberId', { memberId })
      .leftJoinAndSelect('memberDetail.member', 'member')
      .getOne();
  }
}

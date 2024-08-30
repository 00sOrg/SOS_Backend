import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Member, MemberDetail } from '../entities';

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
    // 현재 memberId에 해당하는 MemberDetail이 있는지 확인
    const memberDetail = await this.memberDetailRepository.findOne({
      where: { member: { id: memberId } },
    });

    if (memberDetail) {
      await this.memberDetailRepository.update(
        { member: { id: memberId } },
        updateData,
      );
    } else {
      const newMemberDetail = this.memberDetailRepository.create({
        ...updateData,
        member: { id: memberId } as Member,
      });
      await this.memberDetailRepository.save(newMemberDetail);
    }
  }
}

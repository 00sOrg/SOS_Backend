import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { Member } from '../entities/member.entity';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async update(memberId: number, updateData: Partial<Member>): Promise<void> {
    await this.memberRepository.update(memberId, updateData);
  }

  async findById(memberId: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id: memberId },
    });
  }

  async findByIds(ids: number[]): Promise<Member[] | undefined> {
    return this.memberRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { email: email },
    });
  }

  async findByNickname(nickname: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { nickname: nickname },
    });
  }
}

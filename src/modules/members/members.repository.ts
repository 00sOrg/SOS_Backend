import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
  }

  async create(createMemberDto: Partial<Member>): Promise<Member> {
    const member = this.memberRepository.create(createMemberDto);
    return this.memberRepository.save(member);
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findOneByEmail(email: string): Promise<Member | undefined> {
    return this.memberRepository.findOne({
      where: { email },
    });
  }

  async findById(memberId: number): Promise<Member> {
    return this.memberRepository.findOne({
      where: {
        id: memberId,
      },
    });
  }
}
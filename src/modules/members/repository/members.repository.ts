import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Member } from '../entities/member.entity';
import { Favorite } from '../entities';
import { CreateMemberDto } from '../../auth/dto/create-member.dto';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
  }

  async createMember(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findOneById(memberId: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id: memberId },
    });
  }

  async findOneByEmail(email: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { email },
    });
  }

  async findOneByNickname(nickname: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { nickname },
    });
  }
}
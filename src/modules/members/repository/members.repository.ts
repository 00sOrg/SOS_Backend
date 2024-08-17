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

  async create(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findById(memberId: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id: memberId },
    });
  }

  async findByEmail(email: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { email },
    });
  }

  async findByNickname(nickname: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { nickname },
    });
  }
}
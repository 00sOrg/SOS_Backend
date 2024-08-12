import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { CreateMemberDto } from '../auth/dto/create-member.dto';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
  }

  async create(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async save(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findById(memberId: number): Promise<Member> {
    return this.memberRepository.findOne({
      where: { id: memberId },
    });
  }

  async findOneByEmail(email: string): Promise<Member | undefined> {
    return this.memberRepository.findOne({
      where: { email },
    });
  }

  async findOneByNickname(nickname: string): Promise<Member | undefined> {
    return this.memberRepository.findOne({
      where: { nickname },
    });
  }

  // async findOneByEmailAndPassword(email: string, password: string): Promise<Member | undefined> {
  //   const member = await this.memberRepository.findOne({
  //     where: { email }
  //   });

  //   if (member && await bcrypt.compare(password, member.password)) {
  //     return member;
  //   }

  //   return undefined;
  // }
  
}
import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { CreateMemberDto } from '../../auth/dto/create-member.dto';
import { Member } from '../entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
  ) {}

  async create(request: CreateMemberDto): Promise<Member> {
    const member = request.toMember();
    return await this.membersRepository.create(member);
  }

  async findByEmail(email: string): Promise<Member> {
    const member = await this.membersRepository.findByEmail(email);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async findByNickname(nickname: string): Promise<Member> {
    const member = await this.membersRepository.findByNickname(nickname);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }
}

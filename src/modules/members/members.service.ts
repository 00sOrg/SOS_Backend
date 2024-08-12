import { Injectable } from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { UpdateMemberDto } from '../auth/dto/update-member.dto';
import { Member } from './entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MemberBuilder } from './entities/builder/member.builder';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async create(request: CreateMemberDto): Promise<Member> {
    // DTO에서 유효성 검사가 처리됨
    const member = request.toMember();
    return await this.membersRepository.create(member);
  }

  // TODO: findOneByEmailandPassword
  // async findOneByEmailAndPassword(email: string, password: string){
  //   const member = await this.membersRepository.findOneByEmailAndPassword(email);
  //   if (!member) {
  //     throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
  //   }
  //   return member;
  // }

  async findOneByEmail(email: string): Promise<Member | undefined> {
    const member = await this.membersRepository.findOneByEmail(email);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async findOneByNickname(nickname: string): Promise<Member | undefined> {
    const member = await this.membersRepository.findOneByNickname(nickname);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

}

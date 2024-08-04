import { Injectable } from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MemberBuilder } from './entities/builder/member.builder';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async create(request: CreateMemberDto): Promise<void> {
    if(!request.email && !request.password && !request.name && !request.nickname){
      throw new ExceptionHandler(ErrorStatus.MEBER_INFO_NOT_FOUND);
    }

    const member = new MemberBuilder()
    .email(request.email)
    .password(request.password)
    .name(request.name)
    .nickname(request.nickname)
    .build();
    
    await this.membersRepository.create(member);
  }

  async findOneByEmail(email: string): Promise<Member | undefined> {
    return this.membersRepository.findOneByEmail(email);
  }


  // findAll() {
  //   return `This action returns all members`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} member`;
  // }

  // update(id: number, updateMemberDto: UpdateMemberDto) {
  //   return `This action updates a #${id} member`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} member`;
  // }
  
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from './entities';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    const member = this.membersRepository.create(createMemberDto);
    return this.membersRepository.save(member);
  }
  
  async findOneByEmail(email: string): Promise<Member | undefined> {
    return this.membersRepository.findOne({ where: { email } });
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

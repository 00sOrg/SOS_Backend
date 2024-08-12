import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MembersService } from '../members/members.service';
import { Member } from '../members/entities';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { ValidateMemberDto } from './dto/validate-member.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateMember(email:string, password:string): Promise<Member> {
    const member = await this.membersService.findOneByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      throw new ExceptionHandler(ErrorStatus.INVALID_PASSWORD);
    }
    return member;
  }

  async login(member: Member):Promise<Object> {
    const payload = { email: member.email, sub: member.id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(createMemberDto: CreateMemberDto) {
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
    const newMember = {
      ...createMemberDto,
      password: hashedPassword,
    };
    return this.membersService.create(newMember);
  }
}
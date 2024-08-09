import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MembersService } from '../members/members.service';
import { Member } from '../members/entities';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { LoginMemberDto } from './dto/login-member.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateMember(loginMemberDto: LoginMemberDto): Promise<Member> {
    const { email, password } = loginMemberDto;
    const member = await this.membersService.findOneByEmail(email);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      throw new ExceptionHandler(ErrorStatus.INVALID_PASSWORD);
    }

    return member;
  }

  async login(member: Member) {
    const payload = { email: member.email, sub: member.id };
    return {
      access_token: this.jwtService.sign(payload),
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
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MembersService } from '../members/members.service';
import { Member } from '../members/entities';
import { CreateMemberDto } from '../members/dto/create-member.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateMember(email: string, password: string): Promise<any> {
    const member = await this.membersService.findOneByEmail(email);
    if (member && await bcrypt.compare(password, member.password)) {
      const { password, ...result } = member;
      return result;
    }
    return null;
  }

  async login(member: any) {
    const payload = { email: member.email, sub: member.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createMemberDto: CreateMemberDto) {
    const { password, ...rest } = createMemberDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newMemberDto = {
      ...rest,
      password: hashedPassword,
    } as Member;
    return this.membersService.create(newMemberDto);
  }
}
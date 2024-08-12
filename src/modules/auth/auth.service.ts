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

  async validateMember(validateMemberDto: ValidateMemberDto): Promise<Member> {
    const { email, password } = validateMemberDto;
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

  async checkEmail(email: string) : Promise<void> {
    const existingEmail = await this.membersService.findOneByEmail(email);
    if (existingEmail) {
      throw new ExceptionHandler(ErrorStatus.EMAIL_ALREADY_TAKEN);
    }
  }

  async checkNickName(nickname: string) : Promise<void> {
    const existingNickname = await this.membersService.findOneByNickname(nickname);
    if (existingNickname) {
      throw new ExceptionHandler(ErrorStatus.NICKNAME_ALREADY_TAKEN);
    }
  }

  // 프론트에서 API로 중복확인 + 회원가입에서 중복확인 (동시에 중복되는 요소로 회원가입하는 경우 방지) 
  async register(createMemberDto: CreateMemberDto): Promise<Member | undefined> {
    // 이메일 중복 확인
    await this.checkEmail(createMemberDto.email);
  
    // 닉네임 중복 확인
    await this.checkNickName(createMemberDto.nickname);
  
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(createMemberDto.password, 10);
  
    // 해시된 비밀번호를 CreateMemberDto에 설정
    createMemberDto.password = hashedPassword;
  
    // CreateMemberDto를 그대로 create 메서드에 전달
    return this.membersService.create(createMemberDto);
  }
}
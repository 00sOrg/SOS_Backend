import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { MembersService } from '../members/services/members.service';
import { Member } from '../members/entities';
import { CreateMemberDto } from './dto/create-member.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MembersRepository } from '../members/repository/members.repository';
import { S3Service } from 'src/external/s3/s3.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly membersService: MembersService,
    private readonly membersRepository: MembersRepository,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
  ) {}

  async validateMember(email: string, password: string): Promise<Member> {
    const member = await this.membersService.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, member.password);
    if (!isPasswordValid) {
      throw new ExceptionHandler(ErrorStatus.INVALID_PASSWORD);
    }
    return member;
  }

  async login(member: Member): Promise<object> {
    const payload = { email: member.email, sub: member.id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async checkEmail(email: string): Promise<void> {
    const existingEmail = await this.membersRepository.findByEmail(email);
    if (existingEmail) {
      throw new ExceptionHandler(ErrorStatus.EMAIL_ALREADY_TAKEN);
    }
  }

  async checkNickName(nickname: string): Promise<void> {
    const existingNickname =
      await this.membersRepository.findByNickname(nickname);
    if (existingNickname) {
      throw new ExceptionHandler(ErrorStatus.NICKNAME_ALREADY_TAKEN);
    }
  }

  // 프론트에서 API로 중복확인 + 회원가입에서 중복확인 (동시에 중복되는 요소로 회원가입하는 경우 방지)
  async register(
    request: CreateMemberDto,
    media?: Express.Multer.File,
  ): Promise<void> {
    // 이메일 중복 확인
    await this.checkEmail(request.email);

    // 닉네임 중복 확인
    await this.checkNickName(request.nickname);

    //프로필 사진 있으면 업로드
    const url = media ? await this.s3Service.upload(media) : undefined;

    // 비밀번호 해시화
    request.password = await bcrypt.hash(request.password, 10);

    const member = request.toMember(url);
    await this.membersService.create(member);
  }
}

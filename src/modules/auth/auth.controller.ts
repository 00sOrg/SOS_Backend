import { Controller, Get, Post, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const { email, password } = body;
    const member = await this.authService.validateMember(email, password);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEBER_NOT_FOUND);
    }
    return this.authService.login(member);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.register(createMemberDto);
  }
}

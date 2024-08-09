import { Controller, Get, Post, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { LoginMemberDto } from './dto/login-member.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginMemberDto: LoginMemberDto) {
    const member = await this.authService.validateMember(loginMemberDto);
    return this.authService.login(member);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.register(createMemberDto);
  }
}
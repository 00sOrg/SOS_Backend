import { Controller, Get, Post, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Member } from '../members/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Member) {
    return await this.authService.login(req);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.register(createMemberDto);
  }
}
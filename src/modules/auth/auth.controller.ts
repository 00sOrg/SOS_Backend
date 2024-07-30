import { Controller, Get, Post, Request, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/response.dto';
import { UpdateAuthDto } from './dto/request.dto';
import { CreateMemberDto } from '../members/dto/create-member.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.register(createMemberDto);
  }
}

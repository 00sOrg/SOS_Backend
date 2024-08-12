import { Controller, Get, Post, Request, Body, UseGuards, Query, BadRequestException } from '@nestjs/common';
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

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    await this.authService.checkEmail(email);
    return { success: true, message: '이 이메일을 사용할 수 있습니다.' };
  }

  @Get('check-nickname')
  async checkNickname(@Query('nickname') nickname: string) {
    await this.authService.checkNickName(nickname);
    return { success: true, message: '이 닉네임을 사용할 수 있습니다.' };
  }
}
import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Member } from '../members/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: Member): Promise<object> {
    return await this.authService.login(req);
  }

  @Post('register')
  async register(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
    return this.authService.register(createMemberDto);
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string): Promise<void> {
    await this.authService.checkEmail(email);
  }

  @Get('check-nickname')
  async checkNickname(@Query('nickname') nickname: string): Promise<void> {
    await this.authService.checkNickName(nickname);
  }
}

import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { Member } from './entities';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { UpdateMemberDto } from '../auth/dto/update-member.dto';
import { Favorite } from './entities';
import { AuthGuard } from '@nestjs/passport';

@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':email')
  async findOneByEmail(@Param('email') email: string ): Promise<Member | undefined> {
    return this.membersService.findOneByEmail(email);
  }

  // 친구 추가 요청 API
  @UseGuards(AuthGuard('jwt'))
  @Post('favorite/:nickname')
  async addFavorite(
    @Request() req,
    @Param('nickname') nickname: string,
  ): Promise<Favorite | undefined> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.membersService.addFavorite(memberId, nickname);
  }

  // 친구 요청 수락 API
  @UseGuards(AuthGuard('jwt'))
  @Post('favorite/accept/:requesterId')
  async acceptFavoriteRequest(
    @Request() req,
    @Param('requesterId', ParseIntPipe) requesterId: number,
  ): Promise<Favorite> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.membersService.acceptFavoriteRequest(memberId, requesterId);
  }

  // 사용자가 추가한 친구 목록 조회 API
  @UseGuards(AuthGuard('jwt'))
  @Get('favorites')
  async getFavorites(@Request() req) : Promise <Favorite[]>{
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.membersService.getFavoritesForMember(memberId);
  }
}

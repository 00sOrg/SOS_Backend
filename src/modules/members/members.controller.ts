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

@UseGuards(AuthGuard('jwt'))
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get(':email')
  async findOneByEmail(@Param('email') email: string ): Promise<Member | undefined> {
    return this.membersService.findByEmail(email);
  }

  // 친구 추가 요청 API
  @Post('favorite/:nickname')
  async addFavorite(
    @Request() req,
    @Param('nickname') nickname: string,
  ): Promise<Favorite | undefined> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.membersService.addFavorite(memberId, nickname);
  }

  // 친구 요청 수락 API
  @Post('favorite/accept/:requestMemberId')
  async acceptFavoriteRequest(
    @Request() req,
    @Param('requesterId', ParseIntPipe) requestMemberId: number,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.membersService.acceptFavoriteRequest(memberId, requestMemberId);
  }

  @Post('favorite/reject/:requestMemberId')
  async rejectFavoriteRequest(
    @Request() req,
    @Param('requesterId', ParseIntPipe) requestMemberId: number,
  ): Promise<void>{
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.membersService.rejectFavoriteRequest(memberId, requestMemberId);
  }

  // 사용자가 추가한 친구 목록 조회 API
  @Get('favorites')
  async getFavorites(@Request() req) : Promise <Favorite[]>{
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.membersService.getFavoritesForMember(memberId);
  }
}

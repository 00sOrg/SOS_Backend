import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import { Member } from './entities';
import { Favorite } from './entities';
import { AuthGuard } from '@nestjs/passport';
import { MembersService } from './services/members.service';
import { FavoritesService } from './services/favorites.service';
import { LocationService } from './services/location.service';

@UseGuards(AuthGuard('jwt'))
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly favoritesService: FavoritesService,
    private readonly locationService: LocationService,
  ) {}

  @Get(':email')
  async findOneByEmail(@Param('email') email: string): Promise<Member> {
    return this.membersService.findByEmail(email);
  }

  // 친구 추가 요청 API
  @Post('favorite/:nickname')
  async addFavorite(
    @Request() req,
    @Param('nickname') nickname: string,
  ): Promise<Favorite> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.favoritesService.addFavorite(memberId, nickname);
  }

  // 친구 요청 수락 API
  @Post('favorite/accept/:requestMemberId')
  async acceptFavoriteRequest(
    @Request() req,
    @Param('requesterId', ParseIntPipe) requestMemberId: number,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.favoritesService.acceptFavoriteRequest(
      memberId,
      requestMemberId,
    );
  }

  @Post('favorite/reject/:requestMemberId')
  async rejectFavoriteRequest(
    @Request() req,
    @Param('requesterId', ParseIntPipe) requestMemberId: number,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.favoritesService.rejectFavoriteRequest(
      memberId,
      requestMemberId,
    );
  }

  // 사용자가 추가한 친구 목록 조회 API
  @Get('favorites')
  async getFavorites(@Request() req): Promise<Favorite[]> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.favoritesService.getFavoritesForMember(memberId);
  }

  // 사용자의 위치 업데이트 API
  @Post('location/update')
  async updateLocation(
    @Request() req,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID

    await this.locationService.updateLocation(memberId, +lat, +lng);
  }
}

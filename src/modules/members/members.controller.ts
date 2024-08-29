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
import { AuthGuard } from '@nestjs/passport';
import { MembersService } from './services/members.service';
import { FavoritesService } from './services/favorites.service';
import { LocationService } from './services/location.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
import { FindFavoriteListDto } from './dto/find-favorite-list.dto';

@ApiTags('Members')
@UseGuards(AuthGuard('jwt'))
@Controller('members')
@ApiBearerAuth()
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly favoritesService: FavoritesService,
    private readonly locationService: LocationService,
  ) {}

  // 친구 추가 요청 API
  @Post('favorite/:nickname')
  @ApiOperation({ summary: 'Send a request to a friend' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.FAVORITE_ALREADY_EXISTS,
    ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
  async addFavorite(
    @Request() req,
    @Param('nickname') nickname: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.favoritesService.addFavorite(memberId, nickname);
  }

  // 친구 요청 수락 API
  @Post('favorite/accept/:requestMemberId')
  @ApiOperation({ summary: 'Accept a request from a friend' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.FAVORITE_REQUEST_NOT_FOUND,
    ErrorStatus.FAVORITE_ALREADY_EXISTS,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
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
  @ApiOperation({ summary: 'Reject a request from a friend' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.FAVORITE_REQUEST_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
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
  @ApiOperation({ summary: 'Get all the friends' })
  @ApiSuccessResponse(FindFavoriteListDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async getFavorites(@Request() req): Promise<FindFavoriteListDto> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    const favoriteMembers =
      await this.favoritesService.getFavoritesForMember(memberId);
    return FindFavoriteListDto.of(favoriteMembers);
  }

  // 사용자의 위치 업데이트 API
  @Post('location/update')
  @ApiOperation({ summary: 'Update location' })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async updateLocation(
    @Request() req,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID

    await this.locationService.updateLocation(memberId, +lat, +lng);
  }
}

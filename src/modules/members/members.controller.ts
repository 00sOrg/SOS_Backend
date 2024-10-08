import {
  Controller,
  Post,
  Param,
  UseGuards,
  Get,
  ParseIntPipe,
  Request,
  Query,
  UseInterceptors,
  Body,
  Patch,
  UploadedFile,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembersService } from './services/members.service';
import { FavoritesService } from './services/favorites.service';
import { LocationService } from './services/location.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
import { FindFavoriteListDto } from './dto/find-favorite-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateMemberDto } from './dto/update-member.dto';
import { SearchMemberDto } from './dto/search-member.dto';
import { GetMemberInfoDto } from './dto/get-memberInfo.dto';
import { GetMemberDetailInfoDto } from './dto/get-memberDetail-info.dto';
import { UpdateMemberDetailDto } from './dto/update-member-detail.dto';

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

  // <Members Service 메서드 호출 API>
  @UseInterceptors(FileInterceptor('media'))
  @Patch('update')
  @ApiOperation({ summary: 'Update Member' })
  @ApiConsumes('multipart/form-data')
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.NICKNAME_ALREADY_TAKEN,
    ErrorStatus.S3_UPLOAD_FAILURE,
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nickname: { type: 'string' },
        password: { type: 'string' },
        phoneNumber: { type: 'string' },
        sex: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        profilePicture: { type: 'string' },
        media: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async updateMember(
    @Request() req,
    @Body() request: UpdateMemberDto,
    @UploadedFile() media: Express.Multer.File,
  ): Promise<void> {
    const member = req.user;
    await this.membersService.updateMember(member, request, media);
  }

  // <Favorites Service 메서드 호출 API>
  // 관심 사용자 추가 요청 API
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
    const member = req.user; // 현재 로그인된 사용자
    await this.favoritesService.addFavorite(member, nickname);
  }

  // 관심 사용자 요청 수락 API
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
    @Param('requestMemberId') requestMemberId: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자 ID
    await this.favoritesService.acceptFavoriteRequest(
      memberId,
      Number(requestMemberId),
    );
  }

  // 관심 사용자 요청 거절 API
  @Post('favorite/reject/:requestMemberId')
  @ApiOperation({ summary: 'Reject a request from a friend' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.FAVORITE_REQUEST_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
  async rejectFavoriteRequest(
    @Request() req,
    @Param('requestMemberId') requestMemberId: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.favoritesService.rejectFavoriteRequest(
      memberId,
      Number(requestMemberId),
    );
  }

  // 사용자가 추가한 관심 사용자 목록 조회 API
  @Get('favorites')
  @ApiOperation({ summary: 'Get all the friends' })
  @ApiSuccessResponse(FindFavoriteListDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async getFavorites(@Request() req): Promise<FindFavoriteListDto> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    return this.favoritesService.getFavoritesForMember(memberId);
  }

  // 관심 사용자 정보 수정 API
  @Patch('favorite/update/:favoritedMemberId/:nickname')
  @ApiOperation({ summary: 'Update favorite Nickname' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.FAVORITE_NOT_FOUND,
  )
  async updateFavorite(
    @Request() req,
    @Param('favoritedMemberId', ParseIntPipe) favoritedMemberId: number,
    @Param('nickname') nickname: string,
  ): Promise<void> {
    const memberId = req.user.id; // 현재 로그인된 사용자의 ID
    await this.favoritesService.updateFavorite(
      memberId,
      favoritedMemberId,
      nickname,
    );
  }

  // <Location Service 메서드 호출 API>
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

  @Get('search')
  @ApiOperation({ summary: 'search user by nickname' })
  @ApiSuccessResponse(SearchMemberDto)
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
  async findMemberByNickname(
    @Query('nickname') nickname: string,
  ): Promise<SearchMemberDto> {
    return await this.membersService.findMemberAndAddressByNickname(nickname);
  }

  @Get('/:id(\\d+)')
  @ApiOperation({ summary: 'Get member by id' })
  @ApiSuccessResponse(GetMemberInfoDto)
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.MEMBER_NOT_FOUND,
  )
  async findMemberById(@Param('id') id: string): Promise<GetMemberInfoDto> {
    return await this.membersService.findMemberById(Number(id));
  }

  @Delete('favorites/:id')
  @ApiOperation({ summary: 'Delete favorite member' })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async deleteFavorite(@Param('id') id: string, @Req() req): Promise<void> {
    const memberId = req.user.id;
    return await this.favoritesService.deleteFavorite(memberId, Number(id));
  }

  @Get('/detail')
  @ApiOperation({ summary: 'Get member info' })
  @ApiSuccessResponse(GetMemberDetailInfoDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async getMemberDetail(@Req() req): Promise<GetMemberDetailInfoDto> {
    const memberId = req.user.id;
    return await this.membersService.findMemberDetailById(memberId);
  }

  @Patch('/detail')
  @ApiOperation({ summary: 'Update member info' })
  @ApiBody({ type: UpdateMemberDetailDto })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async updateMemberDetail(
    @Req() req,
    @Body() request: UpdateMemberDetailDto,
  ): Promise<void> {
    const member = req.user;
    return await this.membersService.updateMemberDetailById(member, request);
  }
}

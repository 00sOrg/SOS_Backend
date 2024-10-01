import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { MembersService } from '../members/services/members.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
import { FavoritesService } from '../members/services/favorites.service';
@ApiBearerAuth()
@ApiTags('Alarm')
@UseGuards(JwtAuthGuard)
@Controller('alarm')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly memberService: MembersService,
    private readonly favoriteService: FavoritesService,
  ) {}

  @Post('/help/request')
  async sendHelpNotification(
    @Req() req,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const sender = await this.memberService.findByEmail(req.user.email);
    const receivers = await this.memberService.findNearbyAndFavoritingMembers(
      Number(lat),
      Number(lng),
    );
    await this.notificationService.requestHelpToNearby(receivers, sender);
  }

  @Get()
  @ApiOperation({ summary: 'Get notifications' })
  @ApiSuccessResponse(GetNotificationsDto)
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.FAVORITE_NOT_FOUND,
  )
  async getNotifications(@Req() req): Promise<GetNotificationsDto> {
    const member = req.user;
    return await this.notificationService.getNotifications(member);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mark the notification read' })
  @ApiSuccessResponse()
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async markAsRead(@Req() req, @Param('id') id: string): Promise<void> {
    const member = req.user;
    return await this.notificationService.markAsRead(member, Number(id));
  }

  @Post('/help/request/favorite/:id')
  @ApiOperation({ summary: 'Send help request to users near favorite' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.FAVORITE_NOT_FOUND,
  )
  async sendHelpRequestToNearFavorite(@Req() req, @Param('id') id: string) {
    const sender = req.user;
    await this.favoriteService.checkFavorite(sender.id, Number(id));
    const favoriteMember = await this.memberService.findMemberById(Number(id));
    const receivers = await this.memberService.findNearbyAndFavoritingMembers(
      favoriteMember.latitude,
      favoriteMember.longitude,
    );
    await this.notificationService.requestHelpToNearby(receivers, sender);
  }
}

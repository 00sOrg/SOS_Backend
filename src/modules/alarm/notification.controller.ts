import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { MembersService } from '../members/services/members.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
@ApiBearerAuth()
@ApiTags('Alarm')
@UseGuards(JwtAuthGuard)
@Controller('alarm')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly memberService: MembersService,
  ) {}

  @Post('/send/nearby')
  async sendNotification(
    @Req() req,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const sender = await this.memberService.findByEmail(req.user.email);
    const receivers = await this.memberService.findNearbyMembers(+lat, +lng);
    await this.notificationService.sendNotificationsToNearby(receivers, sender);
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
}

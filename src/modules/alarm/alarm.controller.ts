import { Controller, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { MembersService } from '../members/services/members.service';
@ApiBearerAuth()
@ApiTags('Alarm')
@UseGuards(JwtAuthGuard)
@Controller('alarm')
export class AlarmController {
  constructor(
    private readonly alarmService: AlarmService,
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
    await this.alarmService.sendNotificationsToNearby(receivers, sender);
  }
}

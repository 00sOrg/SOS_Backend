import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EventsService } from './service/events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { CommentService } from './service/comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CreateCommentDto } from './dto/create-comment.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FindNearybyDto } from './dto/find-nearyby-events.dto';
import { FindNearbyAllDto } from './dto/find-nearby-all.dto';
import { Event } from './entities';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly commentService: CommentService,
  ) {}

  @UseInterceptors(FileInterceptor('media'))
  @Post()
  async create(
    @Body() request: CreateEventDto,
    @Request() req,
    @UploadedFile() media: Express.Multer.File,
  ): Promise<void> {
    const memberId = req.user.id;
    await this.eventsService.create(request, memberId, media);
  }

  @Get('nearby')
  async findNearyby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<FindNearybyDto> {
    const events = await this.eventsService.findNearby(+lat, +lng);
    return FindNearybyDto.of(events);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(+id);
    return FindEventDto.of(event);
  }

  @Post('comment')
  async createComment(
    @Body() request: CreateCommentDto,
    @Request() req,
  ): Promise<void> {
    const memberId = req.user.id;
    await this.commentService.createComment(request, memberId);
  }

  @Get('/nearby/all')
  async findNearybyAll(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<FindNearbyAllDto> {
    return await this.eventsService.findNearybyAll(+lat, +lng);
  }
}

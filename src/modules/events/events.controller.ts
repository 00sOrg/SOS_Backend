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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiSuccessResponse } from '../../common/decorators/decorators.success.response';
import { ApiFailureResponse } from '../../common/decorators/decoratos.failure.response';
import { ErrorStatus } from '../../common/api/status/error.status';
import { GetFeedsDto } from './dto/get-feeds.dto';
import { EventType } from './entities/enum/event-type.enum';

@ApiBearerAuth()
@ApiTags('Events')
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly commentService: CommentService,
  ) {}

  @UseInterceptors(FileInterceptor('media'))
  @Post()
  @ApiOperation({
    summary: 'Create Event',
    description: '만약 type이 없다면 NONE 으로 보내주세요',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ...{
          title: { type: 'string' },
          content: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          address: { type: 'string' },
          type: {
            type: 'string',
            description:
              Object.values(EventType)
                .map((type) => `${type}`)
                .join(', ') + '.',
          },
        },
        media: {
          type: 'string',
          format: 'binary',
          description: 'Media file',
        },
      },
    },
  })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.EVENT_CONTENTS_NOT_FOUND,
    ErrorStatus.S3_UPLOAD_FAILURE,
  )
  async create(
    @Body() request: CreateEventDto,
    @Request() req,
    @UploadedFile() media: Express.Multer.File,
  ): Promise<void> {
    const member = req.user;
    await this.eventsService.create(request, member, media);
  }

  @Get('map')
  @ApiOperation({
    summary: 'Get nearby events',
    description: 'level은 primary, secondary, all이 있습니다.',
  })
  @ApiSuccessResponse(FindNearybyDto)
  @ApiFailureResponse(
    ErrorStatus.INVALID_GEO_LOCATION,
    ErrorStatus.INVALID_DISASTER_LEVEL,
  )
  async findNearyby(
    @Query('level') level: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<FindNearybyDto> {
    const events = await this.eventsService.findNearby(
      Number(lat),
      Number(lng),
      level,
    );
    return FindNearybyDto.of(events);
  }

  @Get(':id(\\d+)')
  @ApiOperation({ summary: 'Get event by id' })
  @ApiSuccessResponse(FindEventDto)
  @ApiFailureResponse(ErrorStatus.EVENT_NOT_FOUND)
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<FindEventDto> {
    const memberId = req.user.id;
    return await this.eventsService.findOne(Number(id), +memberId);
  }

  @Post('comment')
  @ApiOperation({ summary: 'Write a comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.EVENT_CONTENTS_NOT_FOUND,
  )
  async createComment(
    @Body() request: CreateCommentDto,
    @Request() req,
  ): Promise<void> {
    const memberId = req.user.id;
    await this.commentService.createComment(request, memberId);
  }

  @Get('/nearby/all')
  @ApiOperation({ summary: 'Get all the nearby events' })
  @ApiSuccessResponse(FindNearbyAllDto)
  @ApiFailureResponse(ErrorStatus.INVALID_GEO_LOCATION)
  async findNearybyAll(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ): Promise<FindNearbyAllDto> {
    return await this.eventsService.findNearbyAll(Number(lat), Number(lng));
  }

  @Get('/feeds')
  @ApiOperation({ summary: 'Get all feeds' })
  @ApiSuccessResponse(GetFeedsDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async getFeeds() {
    return await this.eventsService.getFeeds();
  }

  @Post('/like/:eventId')
  @ApiOperation({ summary: 'Like a event' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.EVENT_NOT_FOUND,
    ErrorStatus.EVENT_ALREADY_LIKED,
  )
  async likeEvents(@Param('eventId') eventId: string, @Request() req) {
    const memberId = req.user.id;
    await this.eventsService.likeEvent(Number(eventId), memberId);
  }
}

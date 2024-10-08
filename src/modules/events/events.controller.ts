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
  Delete,
} from '@nestjs/common';
import { EventsService } from './services/events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { CommentService } from './services/comment.service';
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
import { LikeEventDto } from './dto/like-event.dto';
import { SearchEventDto } from './dto/search-event.dto';
import { FindEventOverviewDto } from './dto/find-event-overview.dto';
import { GetEventsDto } from './dto/get-events.dto';

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
    description:
      'level은 primary, secondary, all이 있습니다. zoom은 10~15입니다.',
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
    @Query('zoom') zoom: string,
  ): Promise<FindNearybyDto> {
    const events = await this.eventsService.findNearby(
      Number(lat),
      Number(lng),
      level,
      Number(zoom),
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
    const member = req.user;
    return await this.eventsService.findOne(Number(id), member);
  }

  @Get(':id(\\d+)/overview')
  @ApiOperation({ summary: 'Get overview event by id' })
  @ApiSuccessResponse(FindEventOverviewDto)
  @ApiFailureResponse(
    ErrorStatus.EVENT_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
  async findOneOverview(
    @Param('id') id: string,
  ): Promise<FindEventOverviewDto> {
    return await this.eventsService.findOneOverview(Number(id));
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
    const member = req.user;
    await this.commentService.createComment(request, member);
  }

  @Get('/nearby/all')
  @ApiOperation({ summary: 'Get all the nearby events' })
  @ApiSuccessResponse(FindNearbyAllDto)
  @ApiFailureResponse(
    ErrorStatus.INVALID_GEO_LOCATION,
    ErrorStatus.UNABLE_TO_FIND_ADDRESS,
  )
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
  @ApiOperation({
    summary: 'Like event or cancel like',
    description:
      'isLiked가 true이면 좋아요가 추가되었고, false이면 좋아요가 취소된 것입니다.',
  })
  @ApiSuccessResponse(LikeEventDto)
  @ApiFailureResponse(
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.EVENT_NOT_FOUND,
  )
  async likeEvents(
    @Param('eventId') eventId: string,
    @Request() req,
  ): Promise<LikeEventDto> {
    const member = req.user;
    return await this.eventsService.likeEvent(Number(eventId), member);
  }

  @Get('/map/search')
  @ApiOperation({ summary: 'Search events' })
  @ApiSuccessResponse(SearchEventDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async searchEvents(
    @Query('keyword') keyword: string,
  ): Promise<SearchEventDto> {
    return await this.eventsService.searchEvent(keyword);
  }

  @Post('/admin/primary')
  @UseInterceptors(FileInterceptor('media'))
  @ApiSuccessResponse()
  @ApiFailureResponse()
  async createPrimary(
    @Body() request: CreateEventDto,
    @Request() req,
    @UploadedFile() media: Express.Multer.File,
  ) {
    const member = req.user;
    await this.eventsService.createPrimary(request, member, media);
  }

  @Get()
  @ApiOperation({ summary: '사용자가 작성한 이벤트 목록 조회' })
  @ApiSuccessResponse(GetEventsDto)
  @ApiFailureResponse(ErrorStatus.INTERNAL_SERVER_ERROR)
  async getEvents(@Request() req): Promise<GetEventsDto> {
    const member = req.user;
    return await this.eventsService.getEvents(member);
  }

  @Delete('/comment/:commentId')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.MEMBER_NOT_FOUND,
    ErrorStatus.COMMENT_NOT_FOUND,
    ErrorStatus.COMMENT_NOT_MATCH,
    ErrorStatus.EVENT_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
  )
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    const member = req.user;
    await this.commentService.deleteComment(Number(commentId), member);
  }

  @Delete(':id(\\d+)')
  @ApiOperation({ summary: '이벤트 삭제' })
  @ApiSuccessResponse()
  @ApiFailureResponse(
    ErrorStatus.EVENT_NOT_FOUND,
    ErrorStatus.INTERNAL_SERVER_ERROR,
    ErrorStatus.S3_DELETE_FAILURE,
  )
  async deleteEvent(@Param('id') id: string, @Request() req) {
    const member = req.user;
    await this.eventsService.deleteEvent(Number(id), member);
  }
}

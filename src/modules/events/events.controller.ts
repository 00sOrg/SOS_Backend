import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './service/events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindEventDto } from './dto/find-event.dto';
import { CommentService } from './service/comment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guards';
import { CreateCommentDto } from './dto/create-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly commentService: CommentService
  ) {}

  @Post()
  async create(@Body() request: CreateEventDto, @Request() req): Promise<void> {
    const memberId = req.user.id;
    await this.eventsService.create(request, memberId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.findOne(+id);
    return FindEventDto.of(event);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Post('comment')
  async createComment(@Body() request: CreateCommentDto, @Request() req): Promise<void> {
    const memberId = req.user.id;
    await this.commentService.createComment(request, memberId);
  }
}

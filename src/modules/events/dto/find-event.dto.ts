import { Comment, Event } from '../entities';
import { ApiProperty } from '@nestjs/swagger';

class CommentDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  content: string;
  @ApiProperty()
  memberId: number;
  @ApiProperty()
  memberNickname: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.memberId = comment.member.id;
    this.memberNickname = comment.member.nickname;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}

export class FindEventDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  content?: string;
  @ApiProperty()
  media?: string;
  @ApiProperty()
  likeCount: number = 0;
  @ApiProperty()
  commentCount: number = 0;
  @ApiProperty({ type: [CommentDto] })
  comments?: CommentDto[];
  @ApiProperty()
  createdAt!: Date;

  static of(event: Event): FindEventDto {
    const dto = new FindEventDto();
    const commentDtos = (event.comments ?? []).map((comment) => {
      return new CommentDto(comment);
    });

    dto.id = event.id;
    dto.title = event.title;
    dto.content = event.content;
    dto.media = event.media;
    dto.likeCount = event.likesCount;
    dto.commentCount = event.commentsCount;
    dto.comments = commentDtos;
    dto.createdAt = event.createdAt;
    return dto;
  }
}

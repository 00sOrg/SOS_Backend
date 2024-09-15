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
  memberProfile: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  constructor(comment: Comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.memberId = comment.member.id;
    this.memberNickname = comment.member.nickname;
    this.memberProfile = comment.member.memberDetail!.profilePicture!;
    this.createdAt = comment.createdAt;
    this.updatedAt = comment.updatedAt;
  }
}

export class FindEventDto {
  @ApiProperty()
  id!: number;
  @ApiProperty()
  memberNickname!: string;
  @ApiProperty()
  memberProfile!: string;
  @ApiProperty()
  address!: string;
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
  @ApiProperty()
  liked!: boolean;
  @ApiProperty({ type: [CommentDto] })
  comments?: CommentDto[];
  @ApiProperty()
  createdAt!: Date;

  static of(event: Event, isLiked: boolean): FindEventDto {
    const dto = new FindEventDto();
    const commentDtos = (event.comments ?? []).map((comment) => {
      return new CommentDto(comment);
    });
    dto.id = event.id;
    dto.memberNickname = event.member.nickname;
    dto.memberProfile = event.member.memberDetail!.profilePicture!;
    dto.address = event.address;
    dto.title = event.title;
    dto.content = event.content;
    dto.media = event.media;
    dto.likeCount = event.likesCount;
    dto.commentCount = event.commentsCount;
    dto.liked = isLiked;
    dto.comments = commentDtos;
    dto.createdAt = event.createdAt;
    return dto;
  }
}

import { ApiProperty } from '@nestjs/swagger';

export class LikeEventDto {
  @ApiProperty()
  isLiked: boolean;

  constructor(isLiked: boolean) {
    this.isLiked = isLiked;
  }
  public static of(isLiked: boolean): LikeEventDto {
    return new LikeEventDto(isLiked);
  }
}

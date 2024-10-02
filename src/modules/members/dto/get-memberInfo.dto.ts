import { ApiProperty } from '@nestjs/swagger';
import { Member } from '../entities';

export class GetMemberInfoDto {
  @ApiProperty()
  memberId: number;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  profilePicture?: string;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  updatedAt: Date;

  constructor(
    memberId: number,
    nickname: string,
    longitude: number,
    latitude: number,
    updatedAt: Date,
    profilePicture?: string,
  ) {
    this.memberId = memberId;
    this.nickname = nickname;
    this.profilePicture = profilePicture;
    this.longitude = longitude;
    this.latitude = latitude;
    this.updatedAt = updatedAt;
  }
  static of(member: Member): GetMemberInfoDto {
    return new GetMemberInfoDto(
      member.id,
      member.nickname,
      member.longitude,
      member.latitude,
      member.updatedAt,
      member.memberDetail!.profilePicture,
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Member } from '../entities';

export class SearchMemberDto {
  @ApiProperty()
  memberId: number;

  @ApiProperty()
  memberNickname: string;

  @ApiProperty()
  memberProfile: string;

  @ApiProperty()
  address: string;

  constructor(
    memberId: number,
    memberNickname: string,
    memberProfile: string,
    address: string,
  ) {
    this.memberId = memberId;
    this.memberNickname = memberNickname;
    this.memberProfile = memberProfile;
    this.address = address;
  }

  static of(member: Member, address: string): SearchMemberDto {
    return new SearchMemberDto(
      member.id,
      member.nickname,
      member.memberDetail!.profilePicture!,
      address,
    );
  }
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsPhoneNumber,
  IsDate,
  Matches,
} from 'class-validator';
import { Member } from 'src/modules/members/entities';
import { MemberBuilder } from 'src/modules/members/entities/builder/member.builder';
import { MemberDetailBuilder } from 'src/modules/members/entities/builder/memberDetail.builder';
import { MemberNotificationBuilder } from 'src/modules/members/entities/builder/memberNotification.builder';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @IsEmail({}, { message: '유효한 이메일 주소 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이메일 주소는 필수 입력 항목입니다.' })
  @MaxLength(25, { message: '이메일은 최대 25자 입니다.' })
  @ApiProperty()
  email!: string;

  @IsString({ message: '유효한 비밀번호 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/, {
    message:
      '비밀번호는 6자에서 20자 사이의 길이로, 문자와 숫자를 포함해야 합니다.',
  })
  @ApiProperty()
  password!: string;

  @IsString({ message: '유효한 이름 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @MaxLength(10, { message: '이름은 최대 10자 입니다.' })
  @ApiProperty()
  name!: string;

  @IsString({ message: '유효한 닉네임 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @MaxLength(25, { message: '닉네임은 최대 25자 입니다. ' })
  @ApiProperty()
  nickname!: string;

  @IsPhoneNumber('KR', { message: '유효한 전화번호 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '전화번호는 필수 입력 항목입니다.' })
  @ApiProperty()
  phoneNumber!: string;

  @IsString({ message: '유요한 성별 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '성별 필수 입력 항목입니다.' })
  @ApiProperty()
  sex!: string;

  @IsDate({ message: '유효한 날짜 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '생년월일은 필수 입력 항목입니다.' })
  @ApiProperty()
  birthDate!: Date;

  toMember(mediaUrl?: string): Member {
    const memberDetail = new MemberDetailBuilder()
      .sex(this.sex)
      .birthDate(this.birthDate)
      .profilePicture(mediaUrl)
      .build();

    const memberNotification = new MemberNotificationBuilder().build();

    return new MemberBuilder()
      .email(this.email)
      .password(this.password)
      .name(this.name)
      .nickname(this.nickname)
      .phoneNumber(this.phoneNumber)
      .memberDetail(memberDetail)
      .memberNotification(memberNotification)
      .build();
  }
}

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Member } from 'src/modules/members/entities';
import { MemberBuilder } from 'src/modules/members/entities/builder/member.builder';

export class CreateMemberDto {
  @IsEmail({}, { message: '유효한 이메일 주소 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이메일 주소는 필수 입력 항목입니다.' })
  @MaxLength(25, { message: '이메일은 최대 25자 입니다.' })
  email!: string;

  @IsString({ message: '유효한 비밀번호 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '비밀번호는 필수 입력 항목입니다.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 입니다.' })
  @MaxLength(20, { message: '비밀번호는 최대 20자 입니다.' })
  password!: string;

  @IsString({ message: '유효한 이름 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '이름은 필수 입력 항목입니다.' })
  @MaxLength(10, { message: '이름은 최대 10자 입니다.' })
  name!: string;

  @IsString({ message: '유효한 닉네임 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력 항목입니다.' })
  @MaxLength(20, { message: '닉네임은 최대 25자 입니다. ' })
  nickname!: string;

  @IsPhoneNumber('KR', { message: '유효한 전화번호 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '전화번호는 필수 입력 항목입니다.' })
  phoneNumber!: string;

  toMember(): Member {
    return new MemberBuilder()
      .email(this.email)
      .password(this.password)
      .name(this.name)
      .nickname(this.nickname)
      .phoneNumber(this.phoneNumber)
      .build();
  }
}

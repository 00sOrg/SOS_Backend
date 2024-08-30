import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDto {
  @IsOptional()
  @IsString({ message: '유효한 닉네임 형식을 입력해 주세요.' })
  @MaxLength(16, { message: '닉네임은 최대 25자 입니다.' })
  @ApiProperty({ required: false })
  nickname?: string;

  @IsOptional()
  @IsString({ message: '유효한 비밀번호 형식을 입력해 주세요.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,20}$/, {
    message:
      '비밀번호는 6자에서 20자 사이의 길이로, 문자와 숫자를 포함해야 하며, 허용된 특수 문자는 @, $, !, %, *, ?, & 입니다.',
  })
  @ApiProperty({ required: false })
  password?: string;

  @IsOptional()
  @IsString({ message: '유효한 성별 형식을 입력해 주세요.' })
  @ApiProperty({ required: false })
  sex?: string;

  @IsOptional()
  @IsDate({ message: '유효한 날짜 형식을 입력해 주세요.' })
  @ApiProperty({ required: false })
  birthDate?: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  profilePicture?: string;
}

import {
  IsOptional,
  IsString,
  MaxLength,
  IsDate,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDto {
  @IsOptional()
  @IsString({ message: '유효한 닉네임 형식을 입력해 주세요.' })
  @MaxLength(16, { message: '닉네임은 최대 25자 입니다.' })
  @ApiProperty({ required: false })
  nickname!: string;

  @IsOptional()
  @ApiProperty({ required: false })
  password?: string;

  @IsPhoneNumber('KR', { message: '유효한 전화번호 형식을 입력해 주세요.' })
  @IsNotEmpty({ message: '전화번호는 필수 입력 항목입니다.' })
  @ApiProperty()
  phoneNumber!: string;

  @IsOptional()
  @IsString({ message: '유효한 성별 형식을 입력해 주세요.' })
  @ApiProperty({ required: false })
  sex!: string;

  @IsOptional()
  @IsDate({ message: '유효한 날짜 형식을 입력해 주세요.' })
  @ApiProperty({ required: false })
  birthDate!: Date;

  @IsOptional()
  @ApiProperty({ required: false })
  profilePicture?: string;
}

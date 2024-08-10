import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class ValidateMemberDto {
  @IsEmail({}, {
    message: "유효한 이메일 주소 형식을 입력해 주세요."
  })
  @IsNotEmpty({
    message: "이메일 주소는 필수 입력 항목입니다."
  })
  email: string;

  @IsString({
    message: "유효한 비밀번호 형식을 입력해 주세요."
  })
  @IsNotEmpty({
    message: "비밀번호는 필수 입력 항목입니다."
  })
  @MinLength(6, {
    message: "비밀번호는 최소 6자 입니다."
  })
  @MaxLength(20, {
    message: '비밀번호는 최대 20자 입니다.'
  })
  password: string;
}
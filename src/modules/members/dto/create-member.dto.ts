import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(25)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  nickname: string;
}
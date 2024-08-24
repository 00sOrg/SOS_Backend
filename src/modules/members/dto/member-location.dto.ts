import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class MemberLocationDto {
  @IsNumber(
    {},
    {
      message: '유효한 위도 형식을 입력해 주세요.',
    },
  )
  @IsLatitude({
    message: '유효한 위도를 입력해 주세요.',
  })
  latitude!: number;

  @IsNumber(
    {},
    {
      message: '유효한 경도 형식을 입력해 주세요.',
    },
  )
  @IsLongitude({
    message: '유효한 경도를 입력해 주세요.',
  })
  longitude!: number;
}

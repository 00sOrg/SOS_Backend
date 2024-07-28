import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateEventRequestDto {
    // 나중에 토큰으로 memberId를 가져올 수 있게 수정
    memberId: number;

    @IsNotEmpty({
        message: "제목은 필수 입력 항목입니다."
    })
    @MaxLength(25, {
        message: '제목은 25자 이하여야 합니다.',
    })
    title: string;
  
    content: string;

    image: string;
  
    @IsNotEmpty({
        message: "위도와 경도는 필수 입력 항목입니다."
    })
    @IsNumber({}, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    @Max(90, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    @Min(-90, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    lat: number;
  
    @IsNotEmpty({
        message: "위도와 경도는 필수 입력 항목입니다."
    })
    @IsNumber({}, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    @Max(180, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    @Min(-180, {
        message: "유효한 위도와 경도를 입력해 주세요."
    })
    lng: number;
}
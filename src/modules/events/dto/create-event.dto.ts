import { IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min } from "class-validator";
import { EventBuilder } from "../entities/builder/event.builder";
import { Event } from "../entities";

export class CreateEventDto {
    @IsNotEmpty({
        message: "제목은 필수 입력 항목입니다."
    })
    @MaxLength(25, {
        message: '제목은 최대 25자 입니다.',
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


    toEvent(): Event {
        return new EventBuilder()
            .title(this.title)
            .content(this.content)
            .media(this.image)
            .latitude(this.lat)
            .longitude(this.lng)
            .build();
    }
}
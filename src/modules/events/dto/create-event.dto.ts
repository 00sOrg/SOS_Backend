import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { EventBuilder } from '../entities/builder/event.builder';
import { Event } from '../entities';
import { Member } from 'src/modules/members/entities';
import { DisasterLevel } from '../entities/enum/disaster-level.enum';
import { EventType } from '../entities/enum/event-type.enum';

export class CreateEventDto {
  @IsNotEmpty({
    message: '제목은 필수 입력 항목입니다.',
  })
  @MaxLength(25, {
    message: '제목은 최대 25자 입니다.',
  })
  title!: string;
  content!: string;

  @IsNotEmpty({
    message: '위도와 경도는 필수 입력 항목입니다.',
  })
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

  @IsNotEmpty({
    message: '위도와 경도는 필수 입력 항목입니다.',
  })
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

  @IsNotEmpty({
    message: '주소는 필수 입력 항목입니다.',
  })
  address!: string;

  @IsEnum(EventType, {
    message: '유효한 이벤트 타입을 입력해 주세요.',
  })
  type!: EventType;

  toEvent(member: Member, mediaUrl?: string): Event {
    const type =
      this.type === EventType.NONE || EventType.OTHER
        ? EventType.ACCIDENT
        : this.type;
    return new EventBuilder()
      .title(this.title)
      .content(this.content)
      .latitude(this.latitude)
      .longitude(this.longitude)
      .disasterLevel(DisasterLevel.SECONDARY)
      .address(this.address)
      .type(type)
      .member(member)
      .media(mediaUrl)
      .build();
  }
}

import { IsNotEmpty, IsNumber, MaxLength, IsLatitude, IsLongitude} from 'class-validator';
import { EventBuilder } from '../entities/builder/event.builder';
import { Event } from '../entities';
import { EventType } from '../enum/event-type.enum';
import { Region } from 'src/external/naver/dto/region.dto';
import { Member } from 'src/modules/members/entities';

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


  toEvent(region: Region, member: Member, mediaUrl?: string): Event {
    return new EventBuilder()
      .title(this.title)
      .content(this.content)
      .latitude(this.latitude)
      .longitude(this.longitude)
      .type(EventType.SECONDARY)
      .si(region.si)
      .gu(region.gu)
      .dong(region.dong)
      .member(member)
      .media(mediaUrl)
      .build();
  }
}

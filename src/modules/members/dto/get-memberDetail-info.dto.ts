import { ApiProperty } from '@nestjs/swagger';
import { MemberDetail } from '../entities';

export class GetMemberDetailInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  height: number;

  @ApiProperty()
  weight: number;

  @ApiProperty()
  bloodType: string;

  @ApiProperty()
  disease: string;

  @ApiProperty()
  medication: string;

  constructor(
    name: string,
    sex: string,
    height: number,
    weight: number,
    bloodType: string,
    disease: string,
    medication: string,
  ) {
    this.name = name;
    this.sex = sex;
    this.height = height;
    this.weight = weight;
    this.bloodType = bloodType;
    this.disease = disease;
    this.medication = medication;
  }

  static of(memberDetail: MemberDetail): GetMemberDetailInfoDto {
    return new GetMemberDetailInfoDto(
      memberDetail.member.name,
      memberDetail.sex,
      memberDetail.height!,
      memberDetail.weight!,
      memberDetail.bloodType!,
      memberDetail.disease!,
      memberDetail.medication!,
    );
  }
}

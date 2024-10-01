import { ApiProperty } from '@nestjs/swagger';
import { MemberDetail } from '../entities';

export class GetMemberDetailInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  profilePicture?: string;

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

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  birthDate: Date;

  constructor(
    name: string,
    email: string,
    nickname: string,
    sex: string,
    height: number,
    weight: number,
    bloodType: string,
    disease: string,
    medication: string,
    phoneNumber: string,
    gender: string,
    birth: Date,
    profilePicture?: string,
  ) {
    this.name = name;
    this.sex = sex;
    this.height = height;
    this.weight = weight;
    this.bloodType = bloodType;
    this.disease = disease;
    this.medication = medication;
    this.phoneNumber = phoneNumber;
    this.gender = gender;
    this.birthDate = birth;
    this.nickname = nickname;
    this.profilePicture = profilePicture;
    this.email = email;
  }

  static of(memberDetail: MemberDetail): GetMemberDetailInfoDto {
    return new GetMemberDetailInfoDto(
      memberDetail.member.name,
      memberDetail.member.email,
      memberDetail.member.nickname,
      memberDetail.sex,
      memberDetail.height!,
      memberDetail.weight!,
      memberDetail.bloodType!,
      memberDetail.disease!,
      memberDetail.medication!,
      memberDetail.member.phoneNumber,
      memberDetail.sex,
      memberDetail.birthDate,
      memberDetail.profilePicture,
    );
  }
}

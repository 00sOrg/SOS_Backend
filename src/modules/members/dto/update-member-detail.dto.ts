import { ApiProperty } from '@nestjs/swagger';
import { Member, MemberDetail } from '../entities';
import { MemberDetailBuilder } from '../entities/builder/memberDetail.builder';

export class UpdateMemberDetailDto {
  @ApiProperty()
  sex?: string;

  @ApiProperty()
  birthDate?: Date;

  @ApiProperty()
  height?: number;

  @ApiProperty()
  weight?: number;

  @ApiProperty()
  bloodType?: string;

  @ApiProperty()
  disease?: string;

  @ApiProperty()
  medication?: string;

  toEntity(member: Member): MemberDetail {
    const builder = new MemberDetailBuilder().member(member);
    if (this.sex !== undefined) {
      builder.sex(this.sex);
    }
    if (this.weight !== undefined) {
      builder.weight(this.weight);
    }
    if (this.height !== undefined) {
      builder.height(this.height);
    }
    if (this.birthDate !== undefined) {
      builder.birthDate(this.birthDate);
    }
    if (this.bloodType !== undefined) {
      builder.bloodType(this.bloodType);
    }
    if (this.disease !== undefined) {
      builder.disease(this.disease);
    }
    if (this.medication !== undefined) {
      builder.medication(this.medication);
    }
    return builder.build();
  }
}

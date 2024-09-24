import { MemberDetail } from '../memberDetail.entity';
import { Member } from '../member.entity';

export class MemberDetailBuilder {
  private _memberDetail: MemberDetail;

  constructor() {
    this._memberDetail = new MemberDetail();
  }

  id(id: number): this {
    this._memberDetail.id = id;
    return this;
  }

  sex(sex: string): this {
    this._memberDetail.sex = sex;
    return this;
  }

  birthDate(birthDate: Date): this {
    this._memberDetail.birthDate = birthDate;
    return this;
  }

  profilePicture(profilePicture?: string): this {
    this._memberDetail.profilePicture = profilePicture;
    return this;
  }

  height(height: number): this {
    this._memberDetail.height = height;
    return this;
  }

  weight(weight: number): this {
    this._memberDetail.weight = weight;
    return this;
  }

  bloodType(bloodType: string): this {
    this._memberDetail.bloodType = bloodType;
    return this;
  }

  disease(disease: string): this {
    this._memberDetail.disease = disease;
    return this;
  }

  medication(medication: string): this {
    this._memberDetail.medication = medication;
    return this;
  }

  member(member: Member): this {
    this._memberDetail.member = member;
    return this;
  }

  build(): MemberDetail {
    return this._memberDetail;
  }
}

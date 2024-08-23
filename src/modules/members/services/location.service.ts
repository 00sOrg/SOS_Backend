import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { MemberLocationDto } from '../dto/member-location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async getLastLocation(memberId: number): Promise<MemberLocationDto | null> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
  
    if (member.latitude === undefined || member.longitude === undefined) {
      return null;
    }
  
    const location = new MemberLocationDto();
    location.latitude = member.latitude;
    location.longitude = member.longitude;
  
    return location;
  }

  async updateLocation(memberId: number, latitude: number, longitude: number): Promise<void> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    // 해당 멤버의 위치 정보 업데이트
    await this.membersRepository.update(memberId, { latitude, longitude });
}
}

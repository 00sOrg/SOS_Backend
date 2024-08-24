import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class LocationService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async updateLocation(memberId: number, lat: number, lng: number): Promise<void> {
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION);
    }

    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    // 해당 멤버의 위치 정보 업데이트
    await this.membersRepository.update(memberId, {latitude: lat, longitude: lng });
  }
}

import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class LocationService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async getLastLocation(memberId: number): Promise<{ latitude: number, longitude: number } | null > {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    // latitude와 longitude가 undefined인 경우 null 반환 (Error로 처리해야하나?)
    if (member.latitude === undefined || member.longitude === undefined) {
        return null;
    }

    return {
      latitude: member.latitude,
      longitude: member.longitude,
    };
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

import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { Member, MemberDetail } from '../entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import * as bcrypt from 'bcryptjs';
import { UpdateMemberDto } from '../dto/update-member.dto';
import { S3Service } from 'src/external/s3/s3.service';
import { MembersDetailRepository } from '../repository/membersDetail.repository';
import { NaverService } from '../../../external/naver/naver.service';
import { SearchMemberDto } from '../dto/search-member.dto';
import { GetMemberInfoDto } from '../dto/get-memberInfo.dto';
import { GetMemberDetailInfoDto } from '../dto/get-memberDetail-info.dto';
import { UpdateMemberDetailDto } from '../dto/update-member-detail.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly membersDetailRepository: MembersDetailRepository,
    private readonly s3Service: S3Service,
    private readonly naverService: NaverService,
  ) {}

  async create(member: Member): Promise<Member> {
    return await this.membersRepository.save(member);
  }

  async findByEmail(email: string): Promise<Member> {
    const member = await this.membersRepository.findByEmail(email);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async findByNickname(nickname: string): Promise<Member> {
    const member = await this.membersRepository.findByNickname(nickname);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async updateMember(
    member: Member,
    updateData: UpdateMemberDto,
    media?: Express.Multer.File,
  ): Promise<void> {
    // 닉네임 중복 확인
    member.nickname = updateData.nickname;
    member.phoneNumber = updateData.phoneNumber;
    member.memberDetail!.sex = updateData.sex;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
      member.password = updateData.password;
    }

    if (media) {
      const profilePictureUrl = await this.s3Service.upload(media);
      member.memberDetail!.profilePicture = profilePictureUrl;
    } else {
      member.memberDetail!.profilePicture = updateData.profilePicture;
    }

    const { memberDetail, ...memberUpdateData } = member;
    await this.membersRepository.update(member.id, memberUpdateData as Member);
    await this.membersDetailRepository.update(
      member.id,
      memberDetail as MemberDetail,
    );
  }

  async findNearbyAndFavoritingMembers(
    lat: number,
    lng: number,
  ): Promise<Member[]> {
    if (
      lat === undefined ||
      lat === null ||
      lat < -90 ||
      lat > 90 ||
      lng === undefined ||
      lng === null ||
      lng < -180 ||
      lng > 180
    ) {
      throw new ExceptionHandler(ErrorStatus.INVALID_GEO_LOCATION);
    }
    const earthRadius = 6371000;
    const latDistance = 500 / earthRadius;
    const lngDistance = 500 / (earthRadius * Math.cos((Math.PI * lat) / 180));

    const minLat = lat - (latDistance * 180) / Math.PI;
    const maxLat = lat + (latDistance * 180) / Math.PI;
    const minLng = lng - (lngDistance * 180) / Math.PI;
    const maxLng = lng + (lngDistance * 180) / Math.PI;
    return await this.membersRepository.findNearby(
      minLat,
      maxLat,
      minLng,
      maxLng,
    );
  }

  async findMemberAndAddressByNickname(
    nickname: string,
  ): Promise<SearchMemberDto> {
    const member = await this.membersRepository.findByNickname(nickname);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    const address = await this.naverService.getAddressFromCoordinate(
      member.latitude,
      member.longitude,
    );
    return SearchMemberDto.of(member, address);
  }

  async findMemberById(memberId: number): Promise<GetMemberInfoDto> {
    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return GetMemberInfoDto.of(member);
  }

  async findMemberDetailById(
    memberId: number,
  ): Promise<GetMemberDetailInfoDto> {
    const memberDetail =
      await this.membersDetailRepository.findByMemberId(memberId);
    if (!memberDetail) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_DETAIL_NOT_FOUND);
    }
    return GetMemberDetailInfoDto.of(memberDetail);
  }

  async updateMemberDetailById(
    member: Member,
    request: UpdateMemberDetailDto,
  ): Promise<void> {
    const memberDetail = request.toEntity(member);
    await this.membersDetailRepository.updateByMemberId(
      member.id,
      memberDetail,
    );
  }
}

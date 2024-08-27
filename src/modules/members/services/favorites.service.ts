import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { FavoritesRepository } from '../repository/favorites.repository';
import { Favorite } from '../entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly favoritesRepository: FavoritesRepository,
  ) {}

  // 관심 사용자 요청 생성
  async addFavorite(memberId: number, nickname: string): Promise<void> {
    // 추가하려는 사용자가 있는지
    const favoritedMember =
      await this.membersRepository.findByNickname(nickname);

    if (!favoritedMember) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const existingFavorite = await this.favoritesRepository.findFavorite(
      memberId,
      favoritedMember.id,
    );

    // 이미 친구 관계이거나 요청이 존재하는 경우 처리
    if (existingFavorite) {
      if (existingFavorite.isAccepted) {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
      } else {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT);
      }
    }

    const member = await this.membersRepository.findById(memberId);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    const favorite = new Favorite();
    favorite.member = member;
    favorite.favoritedMember = favoritedMember;

    await this.favoritesRepository.saveFavorite(favorite);
  }

  // 관심 사용자 요청 수락 (여기서 memberId는 요청을 받은 사람의 Id)
  async acceptFavoriteRequest(
    memberId: number,
    requestMemberId: number,
  ): Promise<void> {
    const favorite = await this.favoritesRepository.findFavorite(
      requestMemberId,
      memberId,
    );

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND);
    } else if (favorite.isAccepted) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
    }

    favorite.isAccepted = true;

    await this.favoritesRepository.updateFavorite(requestMemberId, favorite);
  }

  // 관심 사용자 요청 거절
  async rejectFavoriteRequest(
    memberId: number,
    requestMemberId: number,
  ): Promise<void> {
    const favorite = await this.favoritesRepository.findFavorite(
      requestMemberId,
      memberId,
    );

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND);
    }

    await this.favoritesRepository.removeFavorite(favorite);
  }

  // 관심 사용자 조회 (관심 사용자 등록하면 나한테만 사용자가 뜨고, 관심 사용자에겐 내가 안뜬다.)
  async getFavoritesForMember(memberId: number): Promise<Favorite[]> {
    // 1. 관심 사용자 리스트 가져오기
    const favoritedMembers =
      await this.favoritesRepository.findAllFavoritesForMember(memberId);

    if (!favoritedMembers || favoritedMembers.length === 0) {
      return [];
    }

    // 2. 관심 사용자들의 ID 추출
    const favoritedMemberIds = favoritedMembers.map(
      (favorite) => favorite.favoritedMember.id,
    );

    // 3. 회원 탈퇴 여부를 확인하기 위해 한 번에 조회 (TODO: 회원 탈퇴)
    const validMembers =
      await this.membersRepository.findByIds(favoritedMemberIds);

    // 4. 유효한 회원이 없으면 빈 배열 반환
    if (!validMembers || validMembers.length === 0) {
      return [];
    }

    // 5. 유효한 회원 ID 리스트를 추출
    const validMemberIds = new Set(validMembers.map((member) => member.id));

    // 6. 유효한 관심 사용자만 필터링
    const validFavorites = favoritedMembers.filter((favorite) =>
      validMemberIds.has(favorite.favoritedMember.id),
    );

    // 7. 유효한 관심 사용자 리스트 반환
    return validFavorites;
  }
}

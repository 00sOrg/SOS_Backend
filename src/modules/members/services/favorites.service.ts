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
    const favoritedMember =
      await this.membersRepository.findByNickname(nickname);

    if (!favoritedMember) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const existingFavorite = await this.favoritesRepository.findFavorite(
      memberId,
      favoritedMember.id,
    );

    // 이미 관심사용자 관계이거나 요청이 존재하는 경우 처리
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
    const newFavorite = new Favorite();
    newFavorite.member = member;
    newFavorite.favoritedMember = favoritedMember;
    newFavorite.nickname = favoritedMember.nickname;

    await this.favoritesRepository.saveFavorite(newFavorite);
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

    await this.favoritesRepository.updateFavorite(
      requestMemberId,
      memberId,
      favorite,
    );
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
    const favoriteMembers =
      await this.favoritesRepository.findAllFavoritesForMember(memberId);

    return favoriteMembers;
  }

  // 관심 사용자 (닉네임) 수정
  async updateFavorite(
    memberId: number,
    favoritedMemberId: number,
    nickname: string,
  ): Promise<void> {
    const favorite = await this.favoritesRepository.findFavorite(
      memberId,
      favoritedMemberId,
    );

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_NOT_FOUND);
    }

    favorite.nickname = nickname;

    await this.favoritesRepository.updateFavorite(
      memberId,
      favoritedMemberId,
      favorite,
    );
  }
}

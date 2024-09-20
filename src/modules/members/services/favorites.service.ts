import { Injectable } from '@nestjs/common';
import { MembersRepository } from '../repository/members.repository';
import { FavoritesRepository } from '../repository/favorites.repository';
import { Member } from '../entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';
import { FindFavoriteListDto } from '../dto/find-favorite-list.dto';
import { NaverService } from 'src/external/naver/naver.service';
import { FavoriteBuilder } from '../entities/builder/favorite.builder';
import { NotificationType } from '../../alarm/entities/enums/notificationType.enum';
import { NotificationService } from '../../alarm/services/notification.service';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly favoritesRepository: FavoritesRepository,
    private readonly naverService: NaverService,
    private readonly notificationService: NotificationService,
  ) {}

  // 관심 사용자 요청 생성
  async addFavorite(member: Member, nickname: string): Promise<void> {
    const targetMember = await this.membersRepository.findByNickname(nickname);

    if (!targetMember) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const existingFavorite = await this.favoritesRepository.findFavorite(
      member.id,
      targetMember.id,
    );

    // 이미 관심사용자 관계이거나 요청이 존재하는 경우 처리
    if (existingFavorite) {
      if (existingFavorite.isAccepted) {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
      } else {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT);
      }
    }

    const newFavorite = new FavoriteBuilder()
      .member(member)
      .favoritedMember(targetMember)
      .nickname(targetMember.nickname)
      .build();

    const result = await this.favoritesRepository.saveFavorite(newFavorite);
    await this.notificationService.createNotification(
      NotificationType.FAVORITE_REQUEST,
      targetMember,
      result.id,
      'favorite',
    );
  }

  // 관심 사용자 요청 수락 (여기서 member는 요청을 받은 사람)
  async acceptFavoriteRequest(
    memberReceivingRequestId: number, // 요청을 받은 사람
    memberSendingRequestId: number, // 요청을 보낸 사람의 ID
  ): Promise<void> {
    // 요청을 보낸 사람과 요청을 받은 사람 간의 관심 사용자 요청 조회
    const favorite = await this.favoritesRepository.findFavorite(
      memberSendingRequestId, // 요청을 보낸 사람의 ID
      memberReceivingRequestId, // 요청을 받은 사람의 ID
    );

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND);
    } else if (favorite.isAccepted) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
    }

    favorite.isAccepted = true;
    await this.favoritesRepository.updateFavorite(favorite);
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
  async getFavoritesForMember(memberId: number): Promise<FindFavoriteListDto> {
    const favoriteMembers =
      await this.favoritesRepository.findAllFavoritesForMember(memberId);
    const addresses = await Promise.all(
      favoriteMembers.map(async (favorite) => {
        const { latitude, longitude } = favorite.favoritedMember;
        return this.naverService.getAddressFromCoordinate(latitude, longitude);
      }),
    );

    return FindFavoriteListDto.of(favoriteMembers, addresses);
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

    await this.favoritesRepository.updateFavorite(favorite);
  }

  async deleteFavorite(memberId: number, favoriteId: number): Promise<void> {
    await this.favoritesRepository.deleteById(favoriteId, memberId);
  }
}

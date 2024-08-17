import { Injectable } from '@nestjs/common';
import { MembersRepository } from './repository/members.repository';
import { FavoritesRepository } from './repository/favorites.repository';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { Member, Favorite } from './entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly favoritesRepository: FavoritesRepository,  // FavoritesRepository 추가
  ) {}

  async createMember(request: CreateMemberDto): Promise<Member> {
    const member = request.toMember();
    return await this.membersRepository.createMember(member);
  }

  async findOneByEmail(email: string): Promise<Member | null> {
    const member = await this.membersRepository.findOneByEmail(email);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  async findOneByNickname(nickname: string): Promise<Member | null> {
    const member = await this.membersRepository.findOneByNickname(nickname);
    if (!member) {
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }
    return member;
  }

  // 관심 사용자 요청 생성
  async addFavorite(memberId: number, nickname: string): Promise<Favorite | undefined> {
    // 추가하려는 사용자가 있는지
    const favoritedMember = await this.membersRepository.findOneByNickname(nickname);

    if(!favoritedMember){
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const existingFavorite = await this.favoritesRepository.findFavorite(memberId, favoritedMember.id);
  
    // 이미 친구 관계이거나 요청이 존재하는 경우 처리
    if (existingFavorite) {
      if (existingFavorite.isAccepted) {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
      } else {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT);
      }
    }

    const member = await this.membersRepository.findOneById(memberId);
    const favorite = new Favorite();
    favorite.member = member;
    favorite.favoritedMember = favoritedMember;

    return this.favoritesRepository.saveFavorite(favorite);
  }
 
  // 관심 사용자 요청 수락 (여기서 memberId는 요청을 받은 사람의 Id)
  async acceptFavoriteRequest(memberId: number, requestMemberId: number) : Promise<void> {
    const favorite = await this.favoritesRepository.findFavorite(requestMemberId, memberId);

    if(!favorite){
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND)
    }
    else if(favorite.isAccepted === true){
      throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
    }

    favorite.isAccepted = true;

    await this.favoritesRepository.updateFavorite(requestMemberId, favorite);
  }

  // 관심 사용자 요청 거절
  async rejectFavoriteRequest(memberId: number, requestMemberId: number): Promise<void> {
    const favorite = await this.favoritesRepository.findFavorite(requestMemberId, memberId);

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND);
    }

    await this.favoritesRepository.removeFavorite(favorite);
  }

  // 괌심 사용자 조회
  async getFavoritesForMember(memberId: number): Promise<Favorite[]> {
    return this.favoritesRepository.findAllFavoritesForMember(memberId);
  }
}

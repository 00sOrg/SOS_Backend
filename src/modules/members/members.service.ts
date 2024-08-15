import { Injectable } from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { CreateMemberDto } from '../auth/dto/create-member.dto';
import { UpdateMemberDto } from '../auth/dto/update-member.dto';
import { Member, Favorite } from './entities';
import { ExceptionHandler } from 'src/common/filters/exception/exception.handler';
import { ErrorStatus } from 'src/common/api/status/error.status';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: MembersRepository) {}

  async create(request: CreateMemberDto): Promise<Member> {
    // DTO에서 유효성 검사가 처리됨
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

  async addFavorite(memberId: number, nickname: string): Promise<Favorite | undefined> {
    // 추가하려는 사용자가 있는지
    const receiver = await this.membersRepository.findOneByNickname(nickname);

    if(!receiver){
      throw new ExceptionHandler(ErrorStatus.MEMBER_NOT_FOUND);
    }

    const existingFavorite = await this.membersRepository.findFavorite(memberId, receiver.id);
    const reverseFavorite = await this.membersRepository.findFavorite(receiver.id, memberId);

    // 이미 친구 관계이거나 요청이 존재하는 경우 처리
    if (existingFavorite) {
      if (existingFavorite.isAccepted) {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
      } else {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_ALREADY_SENT);
      }
    }

    if (reverseFavorite) {
      if (reverseFavorite.isAccepted) {
        throw new ExceptionHandler(ErrorStatus.FAVORITE_ALREADY_EXISTS);
      } else {
        // 상대방이 먼저 친구 요청을 보낸 경우, 바로 친구 관계를 수락
        reverseFavorite.isAccepted = true;
        return this.membersRepository.saveFavorite(reverseFavorite);
      }
    }

    // 새로운 친구 요청 생성
    const requester = await this.membersRepository.findOneById(memberId);
    const favorite = new Favorite();
    favorite.requester = requester;
    favorite.receiver = receiver;

    return this.membersRepository.saveFavorite(favorite);
  }
 
  async acceptFavoriteRequest(memberId: number, requesterId: number) : Promise<Favorite> {
    const favorite = await this.membersRepository.findFavorite(requesterId, memberId);

    if (!favorite || favorite.isAccepted === true) {
      throw new ExceptionHandler(ErrorStatus.BAD_REQUEST);
    }

    favorite.isAccepted = true;

    return this.membersRepository.saveFavorite(favorite);
  }

  async rejectFavoriteRequest(memberId: number, requesterId: number): Promise<void> {
    const favorite = await this.membersRepository.findFavorite(requesterId, memberId);

    if (!favorite) {
      throw new ExceptionHandler(ErrorStatus.FAVORITE_REQUEST_NOT_FOUND);
    }

    await this.membersRepository.removeFavorite(favorite);
  }

  async getFavoritesForMember(memberId: number): Promise<Favorite[]> {
    return this.membersRepository.findAllFavoritesForMember(memberId);
  }
}

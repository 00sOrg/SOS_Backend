import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { Favorite } from './entities';
import { CreateMemberDto } from '../auth/dto/create-member.dto';

@Injectable()
export class MembersRepository {
  private memberRepository: Repository<Member>;
  private favoriteRepository: Repository<Favorite>;

  constructor(private readonly dataSource: DataSource) {
    this.memberRepository = this.dataSource.getRepository(Member);
    this.favoriteRepository = this.dataSource.getRepository(Favorite);
  }

  async createMember(member: Member): Promise<Member> {
    return this.memberRepository.save(member);
  }

  async findOneById(memberId: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { id: memberId },
    });
  }

  async findOneByEmail(email: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { email },
    });
  }

  async findOneByNickname(nickname: string): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: { nickname },
    });
  }

  async saveFavorite(favorite: Favorite): Promise<Favorite> {
    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(favorite: Favorite): Promise<void> {
    await this.favoriteRepository.remove(favorite);
  }

  async findFavorite(requesterId: number, receiverId: number): Promise<Favorite | null> {
    return this.favoriteRepository.findOne({
      where: {
        requester: { id: requesterId },
        receiver: { id: receiverId },
      },
    });
  }

  // 방법1: 수락된 요청들만 
  async findAllFavoritesForMember(memberId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
        where: [
            { requester: { id: memberId }, isAccepted: true },
            { receiver: { id: memberId }, isAccepted: true },
        ],
    });
  }
  // 방법2: 아직 수락이 안된 요청들도
  // async findAllFavoritesForMember(memberId: number): Promise<Favorite[]> {
  //   return this.favoriteRepository.find({
  //       where: [
  //           { requester: { id: memberId } },
  //           { receiver: { id: memberId }, isAccepted: true },
  //       ],
  //   });
  // }
}
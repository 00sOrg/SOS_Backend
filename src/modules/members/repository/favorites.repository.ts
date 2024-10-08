import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Favorite } from '../entities';

@Injectable()
export class FavoritesRepository {
  private favoriteRepository: Repository<Favorite>;

  constructor(private readonly dataSource: DataSource) {
    this.favoriteRepository = this.dataSource.getRepository(Favorite);
  }

  async saveFavorite(favorite: Favorite): Promise<Favorite> {
    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(favorite: Favorite): Promise<void> {
    await this.favoriteRepository.remove(favorite);
  }

  async updateFavorite(favorite: Partial<Favorite>): Promise<void> {
    await this.favoriteRepository.update({ id: favorite.id }, { ...favorite });
  }

  async findFavorite(
    memberId: number,
    favoritedMemberId: number,
  ): Promise<Favorite | null> {
    return this.favoriteRepository
      .createQueryBuilder('favorite')
      .where('favorite.memberId=:memberId', { memberId })
      .andWhere('favorite.favoritedMemberId=:favoritedMemberId', {
        favoritedMemberId,
      })
      .leftJoinAndSelect('favorite.favoritedMember', 'favoritedMember')
      .leftJoinAndSelect('favorite.member', 'member')
      .getOne();
  }

  async findAllFavoritesForMember(memberId: number): Promise<Favorite[]> {
    return this.favoriteRepository
      .createQueryBuilder('favorite')
      .where('favorite.memberId = :memberId', { memberId })
      .leftJoinAndSelect('favorite.favoritedMember', 'favoritedMember')
      .leftJoinAndSelect(
        'favoritedMember.memberDetail',
        'favoritedMemberDetail',
      )
      .orderBy('favorite.createdAt', 'DESC')
      .getMany();
  }

  async findById(id: number): Promise<Favorite | null> {
    return this.favoriteRepository
      .createQueryBuilder('favorite')
      .where('favorite.id=:favoriteId ', { favoriteId: id })
      .leftJoinAndSelect('favorite.member', 'member')
      .leftJoinAndSelect('favorite.favoritedMember', 'favoritedMember')
      .getOne();
  }

  async deleteById(id: number, memberId: number): Promise<void> {
    await this.favoriteRepository
      .createQueryBuilder('favorite')
      .delete()
      .from(Favorite)
      .where('favorite.id = :id', { id })
      .andWhere('favorite.memberId = :memberId', { memberId })
      .execute();
  }
}

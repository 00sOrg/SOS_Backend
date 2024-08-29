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

  async updateFavorite(
    memberId: number,
    updateData: Partial<Favorite>,
  ): Promise<void> {
    await this.favoriteRepository.update(
      { member: { id: memberId } },
      updateData,
    );
  }

  async findFavorite(
    memberId: number,
    favoritedMemberId: number,
  ): Promise<Favorite | null> {
    return this.favoriteRepository.findOne({
      where: {
        member: { id: memberId },
        favoritedMember: { id: favoritedMemberId },
      },
    });
  }

  async findAllFavoritesForMember(memberId: number): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: [{ member: { id: memberId }, isAccepted: true }],
      relations: ['favoritedMember'],
      order: { createdAt: 'DESC' }, // 최근 추가된 순으로 정렬
    });
  }
}

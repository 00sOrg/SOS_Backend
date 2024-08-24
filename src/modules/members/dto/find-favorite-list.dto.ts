import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from '../entities';

export class FindFavoriteListDto {
  @ApiProperty()
  favorites!: FavoriteDto[];

  public static of(favoriteList: Favorite[]): FindFavoriteListDto {
    const favoriteDtos = favoriteList.map((favorite) => {
      const favoriteDto = new FavoriteDto();
      favoriteDto.favoriteMemberId = favorite.favoritedMember.id;
      favoriteDto.nickname = favorite.nickname;
      return favoriteDto;
    });

    const findFavoriteListDto = new FindFavoriteListDto();
    findFavoriteListDto.favorites = favoriteDtos;

    return findFavoriteListDto;
  }
}

export class FavoriteDto {
  @ApiProperty()
  favoriteMemberId!: number;

  @ApiProperty()
  nickname!: string;
}

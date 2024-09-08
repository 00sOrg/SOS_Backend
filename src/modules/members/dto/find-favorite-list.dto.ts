import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from '../entities';
import { Region } from 'src/external/naver/dto/region.dto';

export class FindFavoriteListDto {
  @ApiProperty()
  favorites!: FavoriteDto[];

  public static of(
    favoriteList: Favorite[],
    regions: Region[],
  ): FindFavoriteListDto {
    const favoriteDtos = favoriteList.map((favorite, index) => {
      const favoriteDto = new FavoriteDto();
      favoriteDto.favoriteMemberId = favorite.favoritedMember.id;
      favoriteDto.nickname = favorite.favoritedMember.nickname;
      favoriteDto.modifiedNickname = favorite.nickname;
      favoriteDto.lastLocation = regions[index].toString();
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

  @ApiProperty()
  modifiedNickname!: string;

  @ApiProperty()
  lastLocation!: string;
}

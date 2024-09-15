import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from '../entities';
import { Region } from 'src/external/naver/dto/region.dto';

export class FavoriteDto {
  @ApiProperty()
  favoriteMemberId!: number;

  @ApiProperty()
  isAccepted!: boolean;

  @ApiProperty()
  nickname!: string;

  @ApiProperty()
  modifiedNickname!: string;

  @ApiProperty()
  lastLocation!: string;
}

export class FindFavoriteListDto {
  @ApiProperty({ type: [FavoriteDto] })
  favorites!: FavoriteDto[];

  public static of(
    favoriteList: Favorite[],
    address: string[],
  ): FindFavoriteListDto {
    const favoriteDtos = favoriteList.map((favorite, index) => {
      const favoriteDto = new FavoriteDto();
      favoriteDto.favoriteMemberId = favorite.favoritedMember.id;
      favoriteDto.isAccepted = favorite.isAccepted;
      favoriteDto.nickname = favorite.favoritedMember.nickname;
      favoriteDto.modifiedNickname = favorite.nickname;
      favoriteDto.lastLocation = address[index];
      return favoriteDto;
    });

    const findFavoriteListDto = new FindFavoriteListDto();
    findFavoriteListDto.favorites = favoriteDtos;

    return findFavoriteListDto;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from '../entities';

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

  @ApiProperty()
  profilePicture!: string;
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
      favoriteDto.profilePicture =
        favorite.favoritedMember.memberDetail!.profilePicture!;
      return favoriteDto;
    });

    const findFavoriteListDto = new FindFavoriteListDto();
    findFavoriteListDto.favorites = favoriteDtos;

    return findFavoriteListDto;
  }
}

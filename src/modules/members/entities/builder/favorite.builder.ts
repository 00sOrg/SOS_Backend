import { Favorite } from '../favorite.entity';
import { Member } from '../member.entity';

export class FavoriteBuilder {
  private _favorite: Favorite;
  constructor() {
    this._favorite = new Favorite();
  }

  id(id: number): this {
    this._favorite.id = id;
    return this;
  }

  member(member: Member): this {
    this._favorite.member = member;
    return this;
  }

  favoritedMember(member: Member): this {
    this._favorite.member = member;
    return this;
  }

  isAccepted(boolean: boolean): this {
    this._favorite.isAccepted = boolean;
    return this;
  }

  nickname(nickname: string): this {
    this._favorite.nickname = nickname;
    return this;
  }

  build(): Favorite {
    return this._favorite;
  }
}

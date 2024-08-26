import { MemberNotification } from '../memberNotification.entity';

export class MemberNotificationBuilder {
  private _memberNotification: MemberNotification;

  constructor() {
    this._memberNotification = new MemberNotification();
  }

  id(id: number): this {
    this._memberNotification.id = id;
    return this;
  }

  commentNotification(commentNotification: boolean): this {
    this._memberNotification.commentNotification = commentNotification;
    return this;
  }

  nearbyNotification(nearbyNotification: boolean): this {
    this._memberNotification.nearbyNotification = nearbyNotification;
    return this;
  }

  favoriteMemberNotification(favoriteMemberNotification: boolean): this {
    this._memberNotification.favoriteMemberNotification =
      favoriteMemberNotification;
    return this;
  }

  nationalDisasterNotification(nationalDisasterNotification: boolean): this {
    this._memberNotification.nationalDisasterNotification =
      nationalDisasterNotification;
    return this;
  }

  helpRequestNotification(helpRequestNotification: boolean): this {
    this._memberNotification.helpRequestNotification = helpRequestNotification;
    return this;
  }

  build(): MemberNotification {
    return this._memberNotification;
  }
}

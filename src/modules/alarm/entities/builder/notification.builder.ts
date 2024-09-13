import { Notification } from '../notification.entity';
import { NotificationType } from '../enums/notificationType.enum';
import { Member } from '../../../members/entities';

export class NotificationBuilder {
  _notification: Notification;
  constructor() {
    this._notification = new Notification();
  }

  id(id: number): this {
    this._notification.id = id;
    return this;
  }

  type(type: NotificationType): this {
    this._notification.type = type;
    return this;
  }

  isRead(isRead: boolean): this {
    this._notification.isRead = isRead;
    return this;
  }

  referenceId(id: number): this {
    this._notification.referenceId = id;
    return this;
  }

  referenceTable(referenceTable: string): this {
    this._notification.referenceTable = referenceTable;
    return this;
  }

  member(member: Member): this {
    this._notification.member = member;
    return this;
  }

  build(): Notification {
    return this._notification;
  }
}

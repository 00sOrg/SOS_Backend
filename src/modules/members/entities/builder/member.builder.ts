import { MemberDetail } from "../memberDetail.entity";
import { UserNotification } from "../userNotification.entity";
import { Member } from "../member.entity";
import { Event } from "src/modules/events/entities";
import { Comment } from "src/modules/events/entities";
import { Favorite } from "../favorite.entity";

export class MemberBuilder {
    private _member: Member;
     
    constructor(){
        this._member = new Member();
    }

    id(id: number): this {
        this._member.id = id;
        return this;
    }

    email(email: string): this {
        this._member.email = email;
        return this;
    }

    password(password: string): this {
        this._member.password = password;
        return this;
    }

    name(name: string): this {
        this._member.name = name;
        return this;
    }

    nickname(nickname: string): this {
        this._member.nickname = nickname;
        return this;
    }

    phoneNumber(phoneNumber: number): this {
        this._member.phoneNumber = phoneNumber;
        return this;
    }

    comments(comments: Comment[]): this {
        this._member.comments = comments as Comment[];
        return this;
    }

    memberDetail(memberDetail: MemberDetail): this {
        this._member.memberDetail = memberDetail;
        return this;
    }

    notification(notification: UserNotification): this {
        this._member.notification = notification;
        return this;
    }

    events(events: Event[]): this {
        this._member.events = events as Event[];
        return this;
    }

    favorites(favorites: Favorite[]): this {
        this._member.favorites = favorites as Favorite[];
        return this;
    }

    build(): Member{
        return this._member;
    }
}
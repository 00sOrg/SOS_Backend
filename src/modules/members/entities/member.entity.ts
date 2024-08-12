import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { Event, Comment } from '../../events/entities';
import { MemberDetail, UserNotification, Favorite } from '.';

@Entity()
export class Member extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint'})
  id: number;

  @Column({ type: 'varchar', length: 25 })
  email: string;

  @Column({ type: 'varchar', length: 100})
  password: string;

  @Column({ type: 'varchar', length: 10 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  nickname: string;

  @OneToOne(() => MemberDetail, (memberDetail) => memberDetail.member, {
    cascade: true,
  })
  memberDetail: MemberDetail;

  @OneToOne(() => UserNotification, (notification) => notification.member, {
    cascade: true,
  })
  notification: UserNotification;

  @OneToMany(() => Favorite, (favorite) => favorite.member)
  favorites: Favorite[];

  // 보류 중
  // @OneToMany(() => Favorite, (favorite) => favorite.favoriteMember)
  // favoritedBy: Favorite[];

  @OneToMany(() => Event, (event) => event.member, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(() => Comment, (comment) => comment.member, {
    cascade: true,
  })
  comments: Comment[];
}

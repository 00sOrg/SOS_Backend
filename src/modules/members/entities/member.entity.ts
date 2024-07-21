import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { Event, Comment } from '../../events/entities/index';
import { MemberDetail, UserNotification, Favorite } from './index';

@Entity('회원')
export class Member extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: '회원ID' })
  memberId: number;

  @Column({ type: 'varchar', length: 25, name: '이메일' })
  email: string;

  @Column({ type: 'varchar', length: 20, name: '비밀번호' })
  password: string;

  @Column({ type: 'varchar', length: 10, name: '이름' })
  name: string;

  @Column({ type: 'varchar', length: 20, name: '닉네임' })
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

  @OneToMany(() => Favorite, (favorite) => favorite.favoriteMember)
  favoritedBy: Favorite[];

  @OneToMany(() => Event, (event) => event.member, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(() => Comment, (comment) => comment.member, {
    cascade: true,
  })
  comments: Comment[];

  // 즐겨찾기 엔티티 중간 테이블 두고 다대다로 구현하는 거는 어떤지?
  //   @ManyToMany(() => Member, (member) => member.favoritedBy)
  //   @JoinTable({
  //     name: 'favorites', // 중간 테이블 이름
  //     joinColumn: {
  //       name: 'memberId',
  //       referencedColumnName: 'memberId'
  //     },
  //     inverseJoinColumn: {
  //       name: 'favoriteId',
  //       referencedColumnName: 'memberId'
  //     }
  //   })
  //   favorites: Member[];

  //   @ManyToMany(() => Member, (member) => member.favorites)
  //   favoritedBy: Member[];
}

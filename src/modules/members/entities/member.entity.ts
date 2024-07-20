import {
  Column,
  Entity,
  OneToOne,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { Event, Comment } from '../../events/entities/event.entity';

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
    cascade: true
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

@Entity('회원 신체정보')
export class MemberDetail extends DefaultEntity {
  @PrimaryColumn({ type: 'bigint', name: '회원ID' })
  memberId: number;

  @OneToOne(() => Member, (member) => member.notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @Column({ type: 'int', nullable: true, name: '키' })
  height: number;

  @Column({ type: 'int', nullable: true, name: '몸무게' })
  weight: number;

  @Column({ type: 'varchar', length: 5, nullable: true, name: '혈액형' })
  bloodType: string;

  @Column({ type: 'text', nullable: true, name: '질병' })
  disease: string;

  @Column({ type: 'text', nullable: true, name: '복용약' })
  medication: string;
}

@Entity('알림')
export class UserNotification extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: '알림ID' })
  notificationId: number;

  @OneToOne(() => Member, (member) => member.notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @Column({ type: 'boolean', default: false, name: '댓글 알림' })
  commentNotification: boolean;

  @Column({ type: 'boolean', default: false, name: '주변 알림' })
  nearbyNotification: boolean;

  @Column({ type: 'boolean', default: false, name: '관심사용자 알림' })
  favoriteUserNotification: boolean;

  @Column({ type: 'boolean', default: false, name: '국가 재난 알림' })
  nationalDisasterNotification: boolean;

  @Column({ type: 'boolean', default: false, name: '도움 요청 알림' })
  helpRequestNotification: boolean;
}

@Entity('관심사용자')
export class Favorite extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ID' })
  id: number;

  @ManyToOne(() => Member, (member) => member.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @ManyToOne(() => Member, (member) => member.favoritedBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '관심사용자ID' })
  favoriteMember: Member;
}

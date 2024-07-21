import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn} from 'typeorm';
import { Member } from './index';
import { DefaultEntity } from 'src/common/default.entity';

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
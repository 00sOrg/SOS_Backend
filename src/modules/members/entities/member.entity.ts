import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { MemberDetail, UserNotification } from '.';

@Entity()
export class Member extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @Column({ type: 'varchar', length: 10 })
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  nickname!: string;

  @Column({ type: 'varchar', length: 15 })
  phoneNumber!: string;

  //프로필 사진 추가

  @Column({ type: 'decimal', precision: 13, scale: 13 })
  latitude: number = 37.23974418506011;
  
  @Column({ type: 'decimal', precision: 13, scale: 13 })
  longitude: number = 127.08342026545051;

  @OneToOne(() => MemberDetail, (memberDetail) => memberDetail.member, {
    cascade: true,
  })
  memberDetail?: MemberDetail;

  @OneToOne(() => UserNotification, (notification) => notification.member, {
    cascade: true,
  })
  notification?: UserNotification;
}

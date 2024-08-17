import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { MemberDetail, UserNotification } from '.';

@Entity()
export class Member extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 25 })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  password!: string;

  @Column({ type: 'varchar', length: 10 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  nickname!: string;

  @Column({ type: 'varchar', length: 15 })
  phoneNumber!: string;

  @OneToOne(() => MemberDetail, (memberDetail) => memberDetail.member, {
    cascade: true,
  })
  memberDetail?: MemberDetail;

  @OneToOne(() => UserNotification, (notification) => notification.member, {
    cascade: true,
  })
  notification?: UserNotification;

  // @OneToMany(() => Event, (event) => event.member, {
  //   cascade: true,
  // })
  // events: Event[];

  // @OneToMany(() => Comment, (comment) => comment.member, {
  //   cascade: true,
  // })
  // comments: Comment[];
}

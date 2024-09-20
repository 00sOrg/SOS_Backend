import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { Favorite, MemberDetail, MemberNotification } from '.';

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

  @Column({ type: 'decimal', precision: 16, scale: 13 })
  latitude: number = 37.23974418506011;

  @Column({ type: 'decimal', precision: 16, scale: 13 })
  longitude: number = 127.08342026545051;

  @Column({ type: 'text', nullable: true })
  device!: string;

  @OneToOne(() => MemberDetail, (memberDetail) => memberDetail.member, {
    cascade: true,
  })
  memberDetail?: MemberDetail;

  @OneToOne(
    () => MemberNotification,
    (memberNotification) => memberNotification.member,
    {
      cascade: true,
    },
  )
  memberNotification?: MemberNotification;

  @OneToMany(() => Favorite, (favorite) => favorite.favoritedMember)
  favoritedByMembers!: Favorite[];
}

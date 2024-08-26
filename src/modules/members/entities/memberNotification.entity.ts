import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from 'src/common/default.entity';

@Entity()
export class MemberNotification extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @OneToOne(() => Member, (member) => member.memberNotification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member!: Member;

  @Column({ type: 'boolean', default: false })
  commentNotification: boolean = false;

  @Column({ type: 'boolean', default: false })
  nearbyNotification: boolean = false;

  @Column({ type: 'boolean', default: false })
  favoriteMemberNotification: boolean = false;

  @Column({ type: 'boolean', default: false })
  nationalDisasterNotification: boolean = false;

  @Column({ type: 'boolean', default: false })
  helpRequestNotification: boolean = false;
}

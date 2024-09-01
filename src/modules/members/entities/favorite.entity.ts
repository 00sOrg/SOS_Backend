import {
  PrimaryGeneratedColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Favorite extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member!: Member;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  favoritedMember!: Member;

  @Column({ type: 'boolean', default: false })
  isAccepted: boolean = false;

  // (내가 보이는) 상대방 닉네임 수정 가능
  @Column({ type: 'varchar', length: 16 })
  nickname!: string;
}

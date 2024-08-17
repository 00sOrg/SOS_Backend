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
}

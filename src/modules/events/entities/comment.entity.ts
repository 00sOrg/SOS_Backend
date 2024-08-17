import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from '../../members/entities';
import { Event } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Comment extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Event)
  @JoinColumn()
  event!: Event;

  @ManyToOne(() => Member)
  @JoinColumn()
  member!: Member;

  @Column({ type: 'text', nullable: true })
  content!: string;
}

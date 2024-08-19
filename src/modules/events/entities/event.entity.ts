import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from '../../members/entities';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Event extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Member)
  @JoinColumn()
  member!: Member;

  @Column({ type: 'varchar', length: 10, nullable: true })
  type!: string;

  @Column({ type: 'text', nullable: true })
  media?: string;

  @Column({ type: 'varchar', length: 25 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'float' })
  latitude!: number;

  @Column({ type: 'float' })
  longitude!: number;

  @Column({ type: 'varchar', length: 25 })
  si!: string;

  @Column({ type: 'varchar', length: 25 })
  gu!: string;

  @Column({ type: 'varchar', length: 25 })
  dong!: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  disasterLevel?: string;

  @Column({ type: 'int', default: 0 })
  likesCount: number = 0;

  @Column({ type: 'int', default: 0 })
  commentsCount: number = 0;
}

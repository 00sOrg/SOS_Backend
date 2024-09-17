import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Member } from '../../members/entities';
import { DefaultEntity } from '../../../common/default.entity';
import { Comment } from './comment.entity';
import { DisasterLevel } from './enum/disaster-level.enum';
import { EventType } from './enum/event-type.enum';

@Entity()
export class Event extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Member)
  @JoinColumn()
  member!: Member;

  @Column({ type: 'varchar', length: 25, nullable: true })
  type!: EventType;

  @Column({ type: 'text', nullable: true })
  media?: string;

  @Column({ type: 'varchar', length: 25 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'decimal', precision: 16, scale: 13 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 16, scale: 13 })
  longitude!: number;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  disasterLevel!: DisasterLevel;

  @Column({ type: 'int', default: 0 })
  likesCount: number = 0;

  @Column({ type: 'int', default: 0 })
  commentsCount: number = 0;

  @OneToMany(() => Comment, (comment) => comment.event, { onDelete: 'CASCADE' })
  comments?: Comment[];

  addCommentCount(): void {
    this.commentsCount++;
  }

  addLikeCount() {
    this.likesCount++;
  }

  removeLikeCount() {
    this.likesCount = this.likesCount > 0 ? this.likesCount - 1 : 0;
  }
}

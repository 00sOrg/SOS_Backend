import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../members/entities/index'; 
import { Event } from './index';
import { DefaultEntity } from '../../../common/default.entity';

@Entity('댓글')
export class Comment extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: '댓글ID' })
  commentId: number;

  @ManyToOne(() => Event, (event) => event.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: '사건ID' })
  event: Event;

  @ManyToOne(() => Member, (member) => member.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @Column({ type: 'text', nullable: true, name: '댓글' })
  content: string;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '../../members/entities'; 
import { Event } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Comment extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  private id: number;

  @ManyToOne(() => Event, (event) => event.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  event: Event;

  @ManyToOne(() => Member, (member) => member.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  member: Member;

  @Column({ type: 'text', nullable: true })
  content: string;
}
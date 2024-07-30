import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from '../../members/entities';
import { Comment } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Event extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Member, (member) => member.events, { onDelete: 'CASCADE' })
  @JoinColumn()
  member: Member;

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];

  @Column({ type: 'varchar', length: 10, nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  media: string;

  @Column({ type: 'varchar', length: 25 })
  title: string;

  @Column({ type: 'text', nullable: true})
  content: string;

  @Column({ type: 'int' })
  latitude: number;

  @Column({ type: 'int' })
  longitude: number;

  @Column({ type: 'varchar', length: 25, nullable: true})
  city: string;

  @Column({ type: 'varchar', length: 25, nullable: true})
  district: string;

  @Column({ type: 'varchar', length: 25, nullable: true})
  neighborhood: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  disasterLevel: string;

  @Column({ type: 'int', default: 0})
  likesCount: number;

  @Column({ type: 'int', default: 0})
  commentsCount: number;
}

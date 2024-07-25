import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Member } from '../../members/entities';
import { Comment } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity('사건')
export class Event extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: '사건ID' })
  eventId: number;

  @ManyToOne(() => Member, (member) => member.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @OneToMany(() => Comment, (comment) => comment.event)
  comments: Comment[];

  @Column({ type: 'varchar', length: 10, nullable: true, name: '종류' })
  type: string;

  @Column({ type: 'text', nullable: true, name: '사진, 영상' })
  media: string;

  @Column({ type: 'varchar', length: 25, name: '제목' })
  title: string;

  @Column({ type: 'text', name: '내용' })
  content: string;

  @Column({ type: 'int', name: '위도' })
  latitude: number;

  @Column({ type: 'int', name: '경도' })
  longitude: number;

  @Column({ type: 'varchar', length: 25, name: '시' })
  city: string;

  @Column({ type: 'varchar', length: 25, name: '동' })
  district: string;

  @Column({ type: 'varchar', length: 25, name: '구' })
  neighborhood: string;

  @Column({ type: 'varchar', length: 25, nullable: true, name: '재난 단계' })
  disasterLevel: string;

  @Column({ type: 'int', nullable: true, name: '공감 갯수' })
  likesCount: number;

  @Column({ type: 'int', nullable: true, name: '댓글 갯수' })
  commentsCount: number;
}

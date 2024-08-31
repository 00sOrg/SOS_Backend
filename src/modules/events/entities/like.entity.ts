import { DefaultEntity } from '../../../common/default.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';
import { Member } from '../../members/entities';
@Entity()
export class Like extends DefaultEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Event, (event) => event.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  event!: Event;

  @ManyToOne(() => Member, (member) => member.id, { onDelete: 'CASCADE' })
  @JoinColumn()
  member!: Member;
}

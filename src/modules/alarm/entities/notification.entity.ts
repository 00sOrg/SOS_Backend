import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DefaultEntity } from '../../../common/default.entity';
import { NotificationType } from './enums/notificationType.enum';
import { Member } from '../../members/entities';

@Entity()
export class Notification extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 25 })
  type!: NotificationType;

  @Column({ type: 'boolean' })
  isRead: boolean = false;

  @Column({ type: 'bigint' })
  referenceId!: number;

  @Column({ type: 'varchar', length: 24 })
  referenceTable!: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn()
  member!: Member;
}

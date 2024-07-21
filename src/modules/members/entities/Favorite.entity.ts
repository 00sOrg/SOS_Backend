import { PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './index';
import { DefaultEntity } from '../../../common/default.entity';

@Entity('관심사용자')
export class Favorite extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ID' })
  id: number;

  @ManyToOne(() => Member, (member) => member.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @ManyToOne(() => Member, (member) => member.favoritedBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '관심사용자ID' })
  favoriteMember: Member;
}

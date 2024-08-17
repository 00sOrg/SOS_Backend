import { PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity()
export class Favorite extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => Member, (member) => member.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'interestedMemberId' }) // 명시적으로 열 이름을 정의
  favoritedMember: Member;
}

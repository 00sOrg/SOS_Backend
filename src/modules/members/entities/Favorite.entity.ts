import { PrimaryGeneratedColumn, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from '../../../common/default.entity';

@Entity('관심사용자')
export class Favorite extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'ID' })
  id: number;

  @ManyToOne(() => Member, (member) => member.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '관심사용자ID' })
  member: Member;

// 보류: 없앨 것인가? 없애면 한 쪽에서 즐찾하면 끝나고 즐찾한 사람이 누군지에 대한 정보는 제공x
// 아니면 팔로우 팔로워처럼 할 것인가? 
//   @ManyToOne(() => Member, (member) => member.favoritedBy, {
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn({ name: '회원ID' })
//   favoriteMember: Member;
}

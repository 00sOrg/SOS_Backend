import { PrimaryColumn, Column, Entity, OneToOne, JoinColumn} from 'typeorm';
import { Member } from './index';
import { DefaultEntity } from 'src/common/default.entity';

@Entity('회원 신체정보')
export class MemberDetail extends DefaultEntity {
  @PrimaryColumn({ type: 'bigint', name: '회원ID' })
  memberId: number;

  @OneToOne(() => Member, (member) => member.notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: '회원ID' })
  member: Member;

  @Column({ type: 'int', nullable: true, name: '키' })
  height: number;

  @Column({ type: 'int', nullable: true, name: '몸무게' })
  weight: number;

  @Column({ type: 'varchar', length: 5, nullable: true, name: '혈액형' })
  bloodType: string;

  @Column({ type: 'text', nullable: true, name: '질병' })
  disease: string;

  @Column({ type: 'text', nullable: true, name: '복용약' })
  medication: string;
}

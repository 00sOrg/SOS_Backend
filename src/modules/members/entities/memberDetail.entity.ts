import { PrimaryColumn, Column, Entity, OneToOne, JoinColumn} from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from 'src/common/default.entity';

@Entity()
export class MemberDetail extends DefaultEntity {
  @PrimaryColumn({ type: 'bigint' })
  private id: number;

  @OneToOne(() => Member, (member) => member.notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member: Member;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodType: string;

  @Column({ type: 'text', nullable: true })
  disease: string;

  @Column({ type: 'text', nullable: true })
  medication: string;
}

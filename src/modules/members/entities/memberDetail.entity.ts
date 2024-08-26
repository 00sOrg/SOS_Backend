import { PrimaryColumn, Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from 'src/common/default.entity';

@Entity()
export class MemberDetail extends DefaultEntity {
  @PrimaryColumn({ type: 'bigint' })
  id!: number;

  @OneToOne(() => Member, (member) => member.memberDetail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member!: Member;

  @Column({ type: 'varchar', length: 8 })
  sex!: string;

  @Column({ type: 'date' })
  birthDate!: Date;

  @Column({ type: 'text', nullable: true })
  profilePicture?: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  height?: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodType?: string;

  //250자 변경
  @Column({ type: 'varchar', length: 250, nullable: true })
  disease?: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  medication?: string;
}

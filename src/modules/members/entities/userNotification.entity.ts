import { PrimaryGeneratedColumn, Column, Entity, OneToOne, JoinColumn} from 'typeorm';
import { Member } from '.';
import { DefaultEntity } from 'src/common/default.entity';

@Entity()
export class UserNotification extends DefaultEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  private id: number;

  @OneToOne(() => Member, (member) => member.notification, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  member: Member;

  @Column({ type: 'boolean', default: false })
  commentNotification: boolean;

  @Column({ type: 'boolean', default: false })
  nearbyNotification: boolean;

  @Column({ type: 'boolean', default: false })
  favoriteUserNotification: boolean;

  @Column({ type: 'boolean', default: false })
  nationalDisasterNotification: boolean;

  @Column({ type: 'boolean', default: false })
  helpRequestNotification: boolean;
}
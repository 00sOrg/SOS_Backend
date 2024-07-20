import { BaseEntity, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

export abstract class DefaultEntity extends BaseEntity {
    @CreateDateColumn({ type: 'timestamp', name: '생성날짜' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', nullable: true, name: '수정날짜' })
    updatedAt: Date;
  
    @DeleteDateColumn({ type: 'timestamp', nullable: true, name: '삭제날짜' })
    deletedAt: Date;
  }
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MATCH = 'MATCH',
  NOTIFY = 'NOTIFY',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  RESOLVE = 'RESOLVE',
  TOGGLE = 'TOGGLE',
}

export enum AuditEntity {
  DONOR = 'donor',
  INVENTORY = 'inventory',
  EMERGENCY = 'emergency',
  NOTIFICATION = 'notification',
  USER = 'user',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: AuditAction })
  action!: AuditAction;

  @Column({ type: 'enum', enum: AuditEntity })
  entity!: AuditEntity;

  @Column({ name: 'entity_id', nullable: true })
  entityId!: string;

  @Column({ name: 'user_id', nullable: true })
  userId!: string;

  @Column({ name: 'user_name', default: 'System' })
  userName!: string;

  @Column({ type: 'text' })
  details!: string;

  @CreateDateColumn()
  timestamp!: Date;
}

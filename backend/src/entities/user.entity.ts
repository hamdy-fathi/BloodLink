import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Notification } from './notification.entity.js';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  MANAGER = 'manager',
  DONOR = 'donor',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF })
  role!: UserRole;

  @Column({ default: '' })
  avatar!: string;

  @Column({ default: '' })
  hospital!: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;

  @OneToMany(() => Notification, (n) => n.user)
  notifications!: Notification[];
}

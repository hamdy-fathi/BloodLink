import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity.js';

export enum NotificationType {
  EMERGENCY = 'emergency',
  SHORTAGE = 'shortage',
  DONATION = 'donation',
  SYSTEM = 'system',
  TRANSFER = 'transfer',
}

export enum DonorResponse {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REFUSED = 'refused',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'boolean', default: false })
  read!: boolean;

  @Column({ type: 'enum', enum: DonorResponse, default: DonorResponse.PENDING })
  response!: DonorResponse;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}


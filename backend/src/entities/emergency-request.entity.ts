import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum UrgencyLevel {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum EmergencyStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled',
}

@Entity('emergency_requests')
export class EmergencyRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  hospital!: string;

  @Column()
  department!: string;

  @Column({ name: 'required_type' })
  requiredType!: string; // blood type string

  @Column({ type: 'int', name: 'units_needed' })
  unitsNeeded!: number;

  @Column({ type: 'enum', enum: UrgencyLevel })
  urgency!: UrgencyLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'float', default: 0 })
  distance!: number;

  @Column({ type: 'enum', enum: EmergencyStatus, default: EmergencyStatus.ACTIVE })
  status!: EmergencyStatus;
}

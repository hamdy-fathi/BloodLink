import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum InventoryStatus {
  HEALTHY = 'Healthy',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
}

@Entity('blood_inventory')
export class BloodInventory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  type!: string; // e.g. "O+", "AB-"

  @Column({ type: 'int', default: 0 })
  units!: number;

  @Column({ type: 'enum', enum: InventoryStatus, default: InventoryStatus.HEALTHY })
  status!: InventoryStatus;

  @Column({ default: '+0%' })
  trend!: string;

  @Column({ type: 'boolean', default: false })
  critical!: boolean;

  @Column({ type: 'int', default: 0, name: 'expiring_in_48h' })
  expiringIn48h!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'last_updated' })
  lastUpdated!: Date;
}

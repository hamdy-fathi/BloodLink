import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum BloodType {
  O_POS = 'O+',
  O_NEG = 'O-',
  A_POS = 'A+',
  A_NEG = 'A-',
  B_POS = 'B+',
  B_NEG = 'B-',
  AB_POS = 'AB+',
  AB_NEG = 'AB-',
}

@Entity('donors')
export class Donor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  phone!: string;

  @Column({ type: 'enum', enum: BloodType })
  bloodType!: BloodType;

  @Column({ type: 'int' })
  age!: number;

  @Column({ type: 'date', nullable: true })
  lastDonation!: string;

  @Column({ type: 'int', default: 0 })
  totalDonations!: number;

  @Column({ type: 'float', default: 50 })
  reliability!: number;

  @Column({ type: 'boolean', default: true })
  available!: boolean;

  @Column({ default: '' })
  city!: string;

  @Column({ type: 'boolean', default: true })
  eligible!: boolean;
}

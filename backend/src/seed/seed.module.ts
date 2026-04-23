import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';
import { User } from '../entities/user.entity.js';
import { Donor } from '../entities/donor.entity.js';
import { BloodInventory } from '../entities/blood-inventory.entity.js';
import { Notification } from '../entities/notification.entity.js';
import { EmergencyRequest } from '../entities/emergency-request.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Donor, BloodInventory, Notification, EmergencyRequest]),
  ],
  providers: [SeedService],
})
export class SeedModule {}

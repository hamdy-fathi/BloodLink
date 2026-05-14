import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergenciesService } from './emergencies.service.js';
import { EmergenciesController } from './emergencies.controller.js';
import { EmergencyRequest } from '../entities/emergency-request.entity.js';
import { DonorsModule } from '../donors/donors.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

import { User } from '../entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmergencyRequest, User]),
    DonorsModule,
    NotificationsModule,
  ],
  controllers: [EmergenciesController],
  providers: [EmergenciesService],
  exports: [EmergenciesService],
})
export class EmergenciesModule {}

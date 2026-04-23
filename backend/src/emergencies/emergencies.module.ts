import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergenciesService } from './emergencies.service.js';
import { EmergenciesController } from './emergencies.controller.js';
import { EmergencyRequest } from '../entities/emergency-request.entity.js';
import { DonorsModule } from '../donors/donors.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmergencyRequest]),
    DonorsModule,
    NotificationsModule,
  ],
  controllers: [EmergenciesController],
  providers: [EmergenciesService],
  exports: [EmergenciesService],
})
export class EmergenciesModule {}

import { Module } from '@nestjs/common';
import { MapService } from './map.service.js';
import { MapController } from './map.controller.js';
import { DonorsModule } from '../donors/donors.module.js';
import { EmergenciesModule } from '../emergencies/emergencies.module.js';

@Module({
  imports: [DonorsModule, EmergenciesModule],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}

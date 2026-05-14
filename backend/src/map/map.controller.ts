import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MapService } from './map.service.js';

@Controller('map')
@UseGuards(AuthGuard('jwt'))
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('data')
  getMapData() {
    return this.mapService.getMapData();
  }
}

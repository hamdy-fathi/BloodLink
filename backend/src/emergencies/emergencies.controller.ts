import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmergenciesService } from './emergencies.service.js';
import { CreateEmergencyDto } from './dto/create-emergency.dto.js';

@Controller('emergencies')
@UseGuards(AuthGuard('jwt'))
export class EmergenciesController {
  constructor(private readonly emergenciesService: EmergenciesService) {}

  @Get()
  findAll() {
    return this.emergenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emergenciesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateEmergencyDto) {
    return this.emergenciesService.create(dto);
  }

  @Get(':id/match')
  matchDonors(@Param('id') id: string) {
    return this.emergenciesService.matchDonors(id);
  }

  @Post(':id/notify')
  notifyDonors(@Param('id') id: string, @Req() req: any) {
    return this.emergenciesService.notifyDonors(id, req.user.userId);
  }

  @Patch(':id/resolve')
  resolve(@Param('id') id: string) {
    return this.emergenciesService.resolve(id);
  }
}

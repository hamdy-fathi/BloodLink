import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmergenciesService } from './emergencies.service.js';
import { CreateEmergencyDto } from './dto/create-emergency.dto.js';
import { UpdateEmergencyDto } from './dto/update-emergency.dto.js';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmergencyDto) {
    return this.emergenciesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emergenciesService.remove(id);
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

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DonorsService } from './donors.service.js';
import { CreateDonorDto } from './dto/create-donor.dto.js';
import { UpdateDonorDto } from './dto/update-donor.dto.js';

@Controller('donors')
@UseGuards(AuthGuard('jwt'))
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('bloodType') bloodType?: string,
    @Query('available') available?: string,
  ) {
    return this.donorsService.findAll({ search, bloodType, available });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.donorsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDonorDto) {
    return this.donorsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDonorDto) {
    return this.donorsService.update(id, dto);
  }

  @Patch(':id/toggle-availability')
  toggleAvailability(@Param('id') id: string) {
    return this.donorsService.toggleAvailability(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.donorsService.remove(id);
  }
}

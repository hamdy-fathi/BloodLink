import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodInventory, InventoryStatus } from '../entities/blood-inventory.entity.js';
import { CreateInventoryDto } from './dto/create-inventory.dto.js';
import { UpdateInventoryDto } from './dto/update-inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(BloodInventory)
    private readonly invRepo: Repository<BloodInventory>,
  ) {}

  async findAll(status?: string) {
    const qb = this.invRepo.createQueryBuilder('inv');

    if (status && status !== 'All') {
      qb.andWhere('inv.status = :status', { status });
    }

    qb.orderBy('inv.type', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.invRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Inventory item not found');
    return item;
  }

  async create(dto: CreateInventoryDto) {
    const item = this.invRepo.create({
      type: dto.type,
      units: dto.units,
      trend: dto.trend || '+0%',
      expiringIn48h: dto.expiringIn48h || 0,
      status: this.getStatus(dto.units),
      critical: dto.units <= 30,
      lastUpdated: new Date(),
    });
    return this.invRepo.save(item);
  }

  async update(id: string, dto: UpdateInventoryDto) {
    const item = await this.findOne(id);

    if (dto.type !== undefined) item.type = dto.type;
    if (dto.trend !== undefined) item.trend = dto.trend;
    if (dto.expiringIn48h !== undefined) item.expiringIn48h = dto.expiringIn48h;

    if (dto.units !== undefined) {
      item.units = dto.units;
      item.status = this.getStatus(dto.units);
      item.critical = dto.units <= 30;
    }

    item.lastUpdated = new Date();
    return this.invRepo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.invRepo.remove(item);
    return { deleted: true };
  }

  private getStatus(units: number): InventoryStatus {
    if (units <= 30) return InventoryStatus.CRITICAL;
    if (units <= 80) return InventoryStatus.WARNING;
    return InventoryStatus.HEALTHY;
  }
}

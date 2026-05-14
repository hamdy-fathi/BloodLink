import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Donor, BloodType } from '../entities/donor.entity.js';
import { CreateDonorDto } from './dto/create-donor.dto.js';
import { UpdateDonorDto } from './dto/update-donor.dto.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity.js';

@Injectable()
export class DonorsService {
  constructor(
    @InjectRepository(Donor)
    private readonly donorRepo: Repository<Donor>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query?: { search?: string; bloodType?: string; available?: string }) {
    const qb = this.donorRepo.createQueryBuilder('donor');

    if (query?.search) {
      const s = `%${query.search}%`;
      qb.andWhere(
        '(donor.name ILIKE :s OR donor.email ILIKE :s OR donor.city ILIKE :s OR donor."bloodType" ILIKE :s)',
        { s },
      );
    }

    if (query?.bloodType && query.bloodType !== 'All') {
      qb.andWhere('donor."bloodType" = :bt', { bt: query.bloodType });
    }

    if (query?.available && query.available !== 'All') {
      qb.andWhere('donor.available = :av', { av: query.available === 'true' });
    }

    qb.orderBy('donor.name', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const donor = await this.donorRepo.findOne({ where: { id } });
    if (!donor) throw new NotFoundException('Donor not found');
    return donor;
  }

  async create(dto: CreateDonorDto) {
    const donor = this.donorRepo.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      bloodType: dto.bloodType as BloodType,
      age: dto.age,
      city: dto.city,
      lastDonation: dto.lastDonation,
      totalDonations: dto.totalDonations ?? 0,
      reliability: dto.reliability ?? 50,
      available: dto.available ?? true,
      eligible: dto.eligible ?? true,
    });
    const saved = await this.donorRepo.save(donor);
    await this.auditService.log(
      AuditAction.CREATE, AuditEntity.DONOR, saved.id,
      null, 'System',
      `Donor "${saved.name}" (${saved.bloodType}) registered from ${saved.city}`,
    );
    return saved;
  }

  async update(id: string, dto: UpdateDonorDto) {
    const donor = await this.findOne(id);

    if (dto.name !== undefined) donor.name = dto.name;
    if (dto.email !== undefined) donor.email = dto.email;
    if (dto.phone !== undefined) donor.phone = dto.phone;
    if (dto.bloodType !== undefined) donor.bloodType = dto.bloodType as BloodType;
    if (dto.age !== undefined) donor.age = dto.age;
    if (dto.city !== undefined) donor.city = dto.city;
    if (dto.lastDonation !== undefined) donor.lastDonation = dto.lastDonation;
    if (dto.totalDonations !== undefined) donor.totalDonations = dto.totalDonations;
    if (dto.reliability !== undefined) donor.reliability = dto.reliability;
    if (dto.available !== undefined) donor.available = dto.available;
    if (dto.eligible !== undefined) donor.eligible = dto.eligible;

    const saved = await this.donorRepo.save(donor);
    await this.auditService.log(
      AuditAction.UPDATE, AuditEntity.DONOR, saved.id,
      null, 'System',
      `Donor "${saved.name}" profile updated`,
    );
    return saved;
  }

  async toggleAvailability(id: string) {
    const donor = await this.findOne(id);
    donor.available = !donor.available;
    const saved = await this.donorRepo.save(donor);
    await this.auditService.log(
      AuditAction.TOGGLE, AuditEntity.DONOR, saved.id,
      null, 'System',
      `Donor "${saved.name}" availability set to ${saved.available ? 'available' : 'unavailable'}`,
    );
    return saved;
  }

  async remove(id: string) {
    const donor = await this.findOne(id);
    const donorName = donor.name;
    const donorId = donor.id;
    await this.donorRepo.remove(donor);
    await this.auditService.log(
      AuditAction.DELETE, AuditEntity.DONOR, donorId,
      null, 'System',
      `Donor "${donorName}" removed from the registry`,
    );
    return { deleted: true };
  }

  async findCompatible(bloodType: string) {
    // Blood compatibility map (who can donate to this type)
    const compatMap: Record<string, string[]> = {
      'O+': ['O+', 'O-'],
      'O-': ['O-'],
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
    };

    const compatibleTypes = compatMap[bloodType] || [bloodType];

    return this.donorRepo
      .createQueryBuilder('donor')
      .where('donor."bloodType" IN (:...types)', { types: compatibleTypes })
      .andWhere('donor.available = :av', { av: true })
      .andWhere('donor.eligible = :el', { el: true })
      .orderBy('donor.reliability', 'DESC')
      .getMany();
  }
}

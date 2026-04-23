import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../entities/emergency-request.entity.js';
import { DonorsService } from '../donors/donors.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../entities/notification.entity.js';
import { CreateEmergencyDto } from './dto/create-emergency.dto.js';

@Injectable()
export class EmergenciesService {
  constructor(
    @InjectRepository(EmergencyRequest)
    private readonly emergencyRepo: Repository<EmergencyRequest>,
    private readonly donorsService: DonorsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll() {
    return this.emergencyRepo.find({
      where: { status: EmergencyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const emergency = await this.emergencyRepo.findOne({ where: { id } });
    if (!emergency) throw new NotFoundException('Emergency request not found');
    return emergency;
  }

  async create(dto: CreateEmergencyDto) {
    const emergency = this.emergencyRepo.create({
      hospital: dto.hospital,
      department: dto.department,
      requiredType: dto.requiredType,
      unitsNeeded: dto.unitsNeeded,
      urgency: dto.urgency as UrgencyLevel,
      distance: dto.distance ?? 0,
    });
    return this.emergencyRepo.save(emergency);
  }

  async matchDonors(id: string) {
    const emergency = await this.findOne(id);

    const compatibleDonors = await this.donorsService.findCompatible(
      emergency.requiredType,
    );

    // Calculate match scores
    const scored = compatibleDonors.map((donor) => {
      // Score based on reliability (0-100), distance is random for now
      const distanceKm = parseFloat((Math.random() * 15 + 0.5).toFixed(1));
      const etaMinutes = Math.round(distanceKm * 3); // ~3 min per km
      const distanceScore = Math.max(0, 100 - distanceKm * 5);
      const score = Math.round(donor.reliability * 0.7 + distanceScore * 0.3);

      return {
        id: donor.id,
        name: donor.name,
        bloodType: donor.bloodType,
        reliability: donor.reliability,
        distance: `${distanceKm} km`,
        eta: `ETA ${etaMinutes}m`,
        score,
        city: donor.city,
        phone: donor.phone,
      };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return {
      emergency,
      totalCompatible: scored.length,
      highReliability: scored.filter((d) => d.reliability >= 90).length,
      donors: scored.slice(0, 10), // top 10
    };
  }

  async notifyDonors(id: string, userId: string) {
    const matchResult = await this.matchDonors(id);
    const emergency = matchResult.emergency;

    // Create a notification for the requesting user
    await this.notificationsService.create({
      type: NotificationType.EMERGENCY,
      title: `Donors Notified for ${emergency.requiredType}`,
      message: `${matchResult.donors.length} compatible donors have been notified for ${emergency.hospital} - ${emergency.department}. ${emergency.unitsNeeded} units needed.`,
      userId,
      read: false,
    });

    return {
      notified: matchResult.donors.length,
      emergency,
    };
  }

  async resolve(id: string) {
    const emergency = await this.findOne(id);
    emergency.status = EmergencyStatus.RESOLVED;
    return this.emergencyRepo.save(emergency);
  }
}

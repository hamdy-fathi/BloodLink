import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../entities/emergency-request.entity.js';
import { DonorsService } from '../donors/donors.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../entities/notification.entity.js';
import { CreateEmergencyDto } from './dto/create-emergency.dto.js';
import { UpdateEmergencyDto } from './dto/update-emergency.dto.js';

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
  // ────────────────────────────────────────────────────────────
  //  ENHANCED MATCHING ENGINE v2
  // ────────────────────────────────────────────────────────────
  //
  //  Score = (Reliability × Wr) + (Proximity × Wp) + (ExactMatch × We) - RecencyPenalty
  //
  //  Weights are tuned per urgency level:
  //    Critical → proximity-heavy (speed matters)
  //    High     → balanced
  //    Medium   → reliability-heavy
  //    Low      → reliability-heavy, proximity low
  //
  //  Factors:
  //    1. Reliability   — donor's historical reliability (0-100)
  //    2. Proximity     — deterministic city-based distance (0-100)
  //    3. Exact Match   — bonus if donor blood type matches exactly (vs just compatible)
  //    4. Recency       — penalty if donor donated recently (< 56 days / 8 weeks)
  // ────────────────────────────────────────────────────────────

  // Simulated Cairo district coordinates for deterministic distance
  private readonly cityCoords: Record<string, { lat: number; lng: number }> = {
    'nasr city':        { lat: 30.0511, lng: 31.3456 },
    'zamalek':          { lat: 30.0608, lng: 31.2194 },
    'heliopolis':       { lat: 30.0866, lng: 31.3225 },
    'maadi':            { lat: 29.9602, lng: 31.2569 },
    'dokki':            { lat: 30.0382, lng: 31.2049 },
    '6th of october city': { lat: 29.9723, lng: 30.9446 },
    'mohandessin':      { lat: 30.0545, lng: 31.2003 },
    'new cairo':        { lat: 30.0098, lng: 31.4913 },
    'downtown':         { lat: 30.0444, lng: 31.2357 },
    'giza':             { lat: 30.0131, lng: 31.2089 },
    'shubra':           { lat: 30.1073, lng: 31.2497 },
    'ain shams':        { lat: 30.1310, lng: 31.3279 },
    'el marg':          { lat: 30.1640, lng: 31.3540 },
    'el matariya':      { lat: 30.1231, lng: 31.3130 },
    'el manial':        { lat: 30.0100, lng: 31.2270 },
  };

  // Default hospital coordinate (central Cairo) for unknown hospitals
  private readonly defaultCoord = { lat: 30.0444, lng: 31.2357 };

  // Urgency-based weight profiles: [reliability, proximity, exactMatch]
  private readonly urgencyWeights: Record<string, { Wr: number; Wp: number; We: number }> = {
    'Critical': { Wr: 0.35, Wp: 0.45, We: 0.20 },
    'High':     { Wr: 0.45, Wp: 0.35, We: 0.20 },
    'Medium':   { Wr: 0.55, Wp: 0.25, We: 0.20 },
    'Low':      { Wr: 0.60, Wp: 0.20, We: 0.20 },
  };

  /**
   * Haversine formula: calculates distance in km between two lat/lng points
   */
  private haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /**
   * Lookup city coordinates (case-insensitive, fuzzy)
   */
  private getCityCoord(city: string): { lat: number; lng: number } {
    const key = city.toLowerCase().trim();
    if (this.cityCoords[key]) return this.cityCoords[key];
    // Fuzzy: check if any known city is contained in the input
    for (const [k, v] of Object.entries(this.cityCoords)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return this.defaultCoord;
  }

  /**
   * Calculate days since last donation
   */
  private daysSinceLastDonation(lastDonation: string | null): number {
    if (!lastDonation) return 999; // No record → no penalty
    const diff = Date.now() - new Date(lastDonation).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  async matchDonors(id: string) {
    const emergency = await this.findOne(id);

    const compatibleDonors = await this.donorsService.findCompatible(
      emergency.requiredType,
    );

    // Resolve hospital location
    const hospitalCoord = this.getCityCoord(emergency.hospital);

    // Get urgency weights
    const weights = this.urgencyWeights[emergency.urgency] ?? this.urgencyWeights['Medium'];

    // Score each donor
    const scored = compatibleDonors.map((donor) => {
      // ── 1. Proximity Score (0-100) via Haversine ──
      const donorCoord = this.getCityCoord(donor.city);
      const distanceKm = parseFloat(
        this.haversineKm(hospitalCoord.lat, hospitalCoord.lng, donorCoord.lat, donorCoord.lng).toFixed(1),
      );
      const proximityScore = Math.max(0, 100 - distanceKm * 2.5); // 40 km → 0

      // ── 2. Reliability Score (already 0-100) ──
      const reliabilityScore = donor.reliability;

      // ── 3. Exact Match Bonus (0 or 100) ──
      const isExactMatch = donor.bloodType === emergency.requiredType;
      const exactMatchScore = isExactMatch ? 100 : 0;

      // ── 4. Recency Penalty ──
      //   Minimum 56 days (8 weeks) between donations for safety
      //   If donated < 56 days ago → penalty proportional to how recent
      const daysSince = this.daysSinceLastDonation(donor.lastDonation);
      const MIN_DAYS = 56;
      let recencyPenalty = 0;
      if (daysSince < MIN_DAYS) {
        // 0 days ago → -25 penalty, 56 days → 0 penalty
        recencyPenalty = Math.round(25 * (1 - daysSince / MIN_DAYS));
      }

      // ── Composite Score ──
      const rawScore =
        reliabilityScore * weights.Wr +
        proximityScore * weights.Wp +
        exactMatchScore * weights.We -
        recencyPenalty;

      const score = Math.max(0, Math.min(100, Math.round(rawScore)));

      // ETA: ~3 min/km in urban Cairo traffic
      const etaMinutes = Math.max(5, Math.round(distanceKm * 3));

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
        isExactMatch,
        daysSinceLastDonation: daysSince,
        recencyPenalty,
      };
    });

    // Sort by score descending, then by exact match, then proximity
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

    return {
      emergency,
      algorithm: 'BloodLink Matching Engine v2',
      weights,
      totalCompatible: scored.length,
      highReliability: scored.filter((d) => d.reliability >= 90).length,
      exactMatches: scored.filter((d) => d.isExactMatch).length,
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

  async update(id: string, dto: UpdateEmergencyDto) {
    const emergency = await this.findOne(id);
    if (dto.hospital !== undefined) emergency.hospital = dto.hospital;
    if (dto.department !== undefined) emergency.department = dto.department;
    if (dto.requiredType !== undefined) emergency.requiredType = dto.requiredType;
    if (dto.unitsNeeded !== undefined) emergency.unitsNeeded = dto.unitsNeeded;
    if (dto.urgency !== undefined) emergency.urgency = dto.urgency as UrgencyLevel;
    if (dto.distance !== undefined) emergency.distance = dto.distance;
    return this.emergencyRepo.save(emergency);
  }

  async remove(id: string) {
    const emergency = await this.findOne(id);
    await this.emergencyRepo.remove(emergency);
    return { deleted: true };
  }

  async resolve(id: string) {
    const emergency = await this.findOne(id);
    emergency.status = EmergencyStatus.RESOLVED;
    return this.emergencyRepo.save(emergency);
  }
}

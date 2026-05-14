import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../entities/emergency-request.entity.js';
import { User } from '../entities/user.entity.js';
import { DonorsService } from '../donors/donors.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { NotificationType } from '../entities/notification.entity.js';
import { CreateEmergencyDto } from './dto/create-emergency.dto.js';
import { UpdateEmergencyDto } from './dto/update-emergency.dto.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity.js';

// ── Cairo District GPS Coordinates ──
const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Nasr City':         { lat: 30.0511, lng: 31.3456 },
  'Zamalek':           { lat: 30.0608, lng: 31.2194 },
  'Heliopolis':        { lat: 30.0866, lng: 31.3225 },
  'Maadi':             { lat: 29.9602, lng: 31.2569 },
  'Dokki':             { lat: 30.0382, lng: 31.2049 },
  '6th of October City': { lat: 29.9723, lng: 30.9446 },
  'Mohandessin':       { lat: 30.0545, lng: 31.2003 },
  'New Cairo':         { lat: 30.0098, lng: 31.4913 },
  'Downtown':          { lat: 30.0444, lng: 31.2357 },
  'Giza':              { lat: 30.0131, lng: 31.2089 },
  'Shubra':            { lat: 30.1073, lng: 31.2497 },
  'Ain Shams':         { lat: 30.1310, lng: 31.3279 },
  'El Marg':           { lat: 30.1640, lng: 31.3540 },
  'El Matariya':       { lat: 30.1231, lng: 31.3130 },
  'El Manial':         { lat: 30.0100, lng: 31.2270 },
};

// ── Hospital → District mapping for known hospitals ──
const HOSPITAL_DISTRICTS: Record<string, string> = {
  'Qasr Al-Ainy Hospital': 'Downtown',
  'Ain Shams Specialized Hospital': 'Ain Shams',
  'Dar El Fouad Hospital': '6th of October City',
  'National Blood Bank of Egypt': 'Downtown',
};

// ── Urgency-Adaptive Weight Profiles ──
const URGENCY_WEIGHTS: Record<string, { Wr: number; Wp: number; We: number; strategy: string }> = {
  'Critical': { Wr: 0.35, Wp: 0.45, We: 0.20, strategy: 'Speed-first — closest reliable donors' },
  'High':     { Wr: 0.45, Wp: 0.35, We: 0.20, strategy: 'Balanced — reliability slightly preferred' },
  'Medium':   { Wr: 0.55, Wp: 0.25, We: 0.20, strategy: 'Reliability-heavy — best donor quality' },
  'Low':      { Wr: 0.60, Wp: 0.20, We: 0.20, strategy: 'Quality-first — distance less critical' },
};

@Injectable()
export class EmergenciesService {
  constructor(
    @InjectRepository(EmergencyRequest)
    private readonly emergencyRepo: Repository<EmergencyRequest>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly donorsService: DonorsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) { }

  // ── Cairo Road Network Graph (Adjacency List in km) ──
  private readonly CAIRO_ROAD_GRAPH: Record<string, Record<string, number>> = {
    'Downtown': { 'Zamalek': 3, 'Dokki': 4, 'El Manial': 3, 'Shubra': 5, 'Heliopolis': 12, 'Maadi': 12, 'Nasr City': 14 },
    'Zamalek': { 'Downtown': 3, 'Mohandessin': 2, 'Dokki': 2 },
    'Dokki': { 'Downtown': 4, 'Zamalek': 2, 'Mohandessin': 2, 'Giza': 3 },
    'Giza': { 'Dokki': 3, 'El Manial': 4, '6th of October City': 25 },
    'Heliopolis': { 'Downtown': 12, 'Nasr City': 5, 'Ain Shams': 4, 'New Cairo': 18 },
    'Nasr City': { 'Downtown': 14, 'Heliopolis': 5, 'New Cairo': 15 },
    'Ain Shams': { 'Heliopolis': 4, 'El Matariya': 3, 'El Marg': 5 },
    'El Matariya': { 'Ain Shams': 3, 'Shubra': 6 },
    'Shubra': { 'Downtown': 5, 'El Matariya': 6 },
    'El Marg': { 'Ain Shams': 5 },
    'El Manial': { 'Downtown': 3, 'Giza': 4, 'Maadi': 8 },
    'Maadi': { 'Downtown': 12, 'El Manial': 8, 'New Cairo': 20 },
    '6th of October City': { 'Giza': 25 },
    'New Cairo': { 'Nasr City': 15, 'Heliopolis': 18, 'Maadi': 20 },
    'Mohandessin': { 'Zamalek': 2, 'Dokki': 2 },
  };

  // ── Dijkstra's Shortest Path Algorithm ──
  private dijkstra(start: string, end: string): number {
    if (start === end) return 0;
    
    // Normalize casing to match graph keys
    const normalize = (name: string) => {
      const key = Object.keys(this.CAIRO_ROAD_GRAPH).find(k => k.toLowerCase() === name.toLowerCase());
      return key || 'Downtown'; // fallback to Downtown if missing
    };

    const startNode = normalize(start);
    const endNode = normalize(end);

    const distances: Record<string, number> = {};
    const unvisited: Set<string> = new Set();

    // Initialize distances
    Object.keys(this.CAIRO_ROAD_GRAPH).forEach(node => {
      distances[node] = Infinity;
      unvisited.add(node);
    });
    distances[startNode] = 0;

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      unvisited.forEach(node => {
        if (distances[node] < minDistance) {
          current = node;
          minDistance = distances[node];
        }
      });

      if (current === null || current === endNode) break;

      unvisited.delete(current);

      const neighbors = this.CAIRO_ROAD_GRAPH[current];
      for (const [neighbor, weight] of Object.entries(neighbors)) {
        if (unvisited.has(neighbor)) {
          const newDist = distances[current] + weight;
          if (newDist < distances[neighbor]) {
            distances[neighbor] = newDist;
          }
        }
      }
    }

    return distances[endNode] === Infinity ? 15 : distances[endNode]; // Fallback to 15km if isolated
  }

  // ── Get coordinates for a district/city name ──
  private getCoords(name: string): { lat: number; lng: number } {
    // Try exact match first
    if (DISTRICT_COORDS[name]) return DISTRICT_COORDS[name];
    // Try case-insensitive match
    const key = Object.keys(DISTRICT_COORDS).find(
      (k) => k.toLowerCase() === name.toLowerCase(),
    );
    if (key) return DISTRICT_COORDS[key];
    // Default to Downtown Cairo
    return DISTRICT_COORDS['Downtown'];
  }

  // ── Get hospital coordinates ──
  private getHospitalCoords(hospital: string): { lat: number; lng: number } {
    if (HOSPITAL_DISTRICTS[hospital]) {
      return this.getCoords(HOSPITAL_DISTRICTS[hospital]);
    }
    // Try to match partial hospital name
    const key = Object.keys(HOSPITAL_DISTRICTS).find(
      (k) => hospital.toLowerCase().includes(k.toLowerCase().split(' ')[0]),
    );
    if (key) return this.getCoords(HOSPITAL_DISTRICTS[key]);
    return DISTRICT_COORDS['Downtown'];
  }

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
    const saved = await this.emergencyRepo.save(emergency);
    await this.auditService.log(
      AuditAction.CREATE, AuditEntity.EMERGENCY, saved.id,
      null, 'System',
      `Emergency request created: ${saved.urgency} — ${saved.requiredType} × ${saved.unitsNeeded} units at ${saved.hospital}`,
    );
    return saved;
  }

  // ── Matching Engine v2: Multi-Factor Scoring Algorithm ──
  async matchDonors(id: string) {
    const emergency = await this.findOne(id);
    const compatibleDonors = await this.donorsService.findCompatible(emergency.requiredType);

    // Get urgency-adaptive weights
    const weights = URGENCY_WEIGHTS[emergency.urgency] || URGENCY_WEIGHTS['Medium'];

    // Get hospital district
    const hospitalDistrict = HOSPITAL_DISTRICTS[emergency.hospital] || 'Downtown';

    const scored = compatibleDonors.map((donor) => {
      // 1. Get road network distance via Dijkstra's algorithm
      const distanceKm = this.dijkstra(hospitalDistrict, donor.city);

      // 3. Proximity score: max(0, 100 - distanceKm × 2.5)
      const proximityScore = Math.max(0, 100 - distanceKm * 2.5);

      // 4. Exact blood type match bonus
      const isExactMatch = donor.bloodType === emergency.requiredType;
      const exactMatchScore = isExactMatch ? 100 : 0;

      // 5. Recency penalty (56-day safety window per WHO guidelines)
      let recencyPenalty = 0;
      let daysSinceLastDonation = 999;
      if (donor.lastDonation) {
        const lastDonation = new Date(donor.lastDonation);
        daysSinceLastDonation = Math.floor(
          (Date.now() - lastDonation.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceLastDonation < 56) {
          recencyPenalty = parseFloat((25 * (1 - daysSinceLastDonation / 56)).toFixed(1));
        }
      }

      // 6. Composite score
      const rawScore =
        donor.reliability * weights.Wr +
        proximityScore * weights.Wp +
        exactMatchScore * weights.We -
        recencyPenalty;

      const score = Math.max(0, Math.round(rawScore));

      const etaMinutes = Math.round(distanceKm * 3); // ~3 min per km in Cairo traffic

      return {
        id: donor.id,
        name: donor.name,
        email: donor.email,
        bloodType: donor.bloodType,
        reliability: donor.reliability,
        distance: `${distanceKm} km`,
        eta: `ETA ${etaMinutes}m`,
        score,
        city: donor.city,
        phone: donor.phone,
        isExactMatch,
        daysSinceLastDonation: daysSinceLastDonation > 999 ? null : daysSinceLastDonation,
        recencyPenalty,
        proximityScore: Math.round(proximityScore),
        distanceKm,
      };
    });

    // Sort by score descending, with tie-breaking:
    // 1. Exact match donors first
    // 2. Closer donors second
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isExactMatch !== b.isExactMatch) return a.isExactMatch ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    });

    await this.auditService.log(
      AuditAction.MATCH, AuditEntity.EMERGENCY, emergency.id,
      null, 'System',
      `Matching Engine v2 ran for ${emergency.requiredType} (${emergency.urgency}): ${scored.length} compatible, ${scored.filter((d) => d.isExactMatch).length} exact matches`,
    );

    return {
      emergency,
      algorithm: `Matching Engine v2 — ${weights.strategy}`,
      weights: { Wr: weights.Wr, Wp: weights.Wp, We: weights.We },
      totalCompatible: scored.length,
      highReliability: scored.filter((d) => d.reliability >= 90).length,
      exactMatches: scored.filter((d) => d.isExactMatch).length,
      donors: scored.slice(0, 10), // top 10
    };
  }

  async notifyDonors(id: string, userId: string) {
    const matchResult = await this.matchDonors(id);
    const emergency = matchResult.emergency;

    // Create a notification for the requesting staff user
    await this.notificationsService.create({
      type: NotificationType.EMERGENCY,
      title: `Donors Notified for ${emergency.requiredType}`,
      message: `${matchResult.donors.length} compatible donors have been notified for ${emergency.hospital} - ${emergency.department}. ${emergency.unitsNeeded} units needed.`,
      userId,
      read: false,
    });

    // Notify each matched donor individually
    for (const donor of matchResult.donors) {
      const user = await this.userRepo.findOne({ where: { email: donor.email } });
      if (user) {
        await this.notificationsService.create({
          type: NotificationType.EMERGENCY,
          title: `URGENT: ${emergency.requiredType} Blood Needed!`,
          message: `You are a match for an emergency at ${emergency.hospital} (${emergency.department}). ${emergency.unitsNeeded} units needed immediately. ${donor.eta}. Distance: ${donor.distance}.`,
          userId: user.id,
          read: false,
        });
      }
    }

    await this.auditService.log(
      AuditAction.NOTIFY, AuditEntity.EMERGENCY, emergency.id,
      userId, 'Staff',
      `${matchResult.donors.length} donors notified for ${emergency.requiredType} at ${emergency.hospital}`,
    );

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
    const saved = await this.emergencyRepo.save(emergency);
    await this.auditService.log(
      AuditAction.UPDATE, AuditEntity.EMERGENCY, saved.id,
      null, 'System',
      `Emergency request updated at ${saved.hospital}`,
    );
    return saved;
  }

  async remove(id: string) {
    const emergency = await this.findOne(id);
    const emergencyId = emergency.id;
    const hospital = emergency.hospital;
    await this.emergencyRepo.remove(emergency);
    await this.auditService.log(
      AuditAction.DELETE, AuditEntity.EMERGENCY, emergencyId,
      null, 'System',
      `Emergency request at ${hospital} deleted`,
    );
    return { deleted: true };
  }

  async resolve(id: string) {
    const emergency = await this.findOne(id);
    emergency.status = EmergencyStatus.RESOLVED;
    const saved = await this.emergencyRepo.save(emergency);
    await this.auditService.log(
      AuditAction.RESOLVE, AuditEntity.EMERGENCY, saved.id,
      null, 'System',
      `Emergency at ${saved.hospital} resolved — ${saved.requiredType} × ${saved.unitsNeeded} units fulfilled`,
    );
    return saved;
  }
}

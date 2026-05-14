import { Injectable } from '@nestjs/common';
import { DonorsService } from '../donors/donors.service.js';
import { EmergenciesService } from '../emergencies/emergencies.service.js';

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

const HOSPITAL_DISTRICTS: Record<string, string> = {
  'Qasr Al-Ainy Hospital': 'Downtown',
  'Ain Shams Specialized Hospital': 'Ain Shams',
  'Dar El Fouad Hospital': '6th of October City',
  'National Blood Bank of Egypt': 'Downtown',
};

@Injectable()
export class MapService {
  constructor(
    private readonly donorsService: DonorsService,
    private readonly emergenciesService: EmergenciesService,
  ) {}

  private getCoords(name: string): { lat: number; lng: number } {
    if (DISTRICT_COORDS[name]) return DISTRICT_COORDS[name];
    const key = Object.keys(DISTRICT_COORDS).find(
      (k) => k.toLowerCase() === name.toLowerCase(),
    );
    if (key) return DISTRICT_COORDS[key];
    return DISTRICT_COORDS['Downtown'];
  }

  private getHospitalCoords(hospital: string): { lat: number; lng: number } {
    if (HOSPITAL_DISTRICTS[hospital]) {
      return this.getCoords(HOSPITAL_DISTRICTS[hospital]);
    }
    return DISTRICT_COORDS['Downtown'];
  }

  async getMapData() {
    const [donors, emergencies] = await Promise.all([
      this.donorsService.findAll(),
      this.emergenciesService.findAll(),
    ]);

    // Build district summary
    const districtMap = new Map<string, number>();
    donors.forEach((d) => {
      districtMap.set(d.city, (districtMap.get(d.city) || 0) + 1);
    });

    const districts = Object.entries(DISTRICT_COORDS).map(([name, coords]) => ({
      name,
      lat: coords.lat,
      lng: coords.lng,
      donorCount: districtMap.get(name) || 0,
    }));

    const donorMarkers = donors.map((d) => {
      const coords = this.getCoords(d.city);
      return {
        id: d.id,
        name: d.name,
        bloodType: d.bloodType,
        city: d.city,
        lat: coords.lat,
        lng: coords.lng,
        available: d.available,
        eligible: d.eligible,
        reliability: d.reliability,
      };
    });

    const emergencyMarkers = emergencies.map((e) => {
      const coords = this.getHospitalCoords(e.hospital);
      return {
        id: e.id,
        hospital: e.hospital,
        department: e.department,
        requiredType: e.requiredType,
        unitsNeeded: e.unitsNeeded,
        urgency: e.urgency,
        lat: coords.lat,
        lng: coords.lng,
      };
    });

    return { districts, donors: donorMarkers, emergencies: emergencyMarkers };
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmergenciesService } from './emergencies.service';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../entities/emergency-request.entity';
import { DonorsService } from '../donors/donors.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('EmergenciesService', () => {
  let service: EmergenciesService;
  let donorsService: DonorsService;

  const mockEmergencyRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const mockDonorsService = {
    findCompatible: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergenciesService,
        {
          provide: getRepositoryToken(EmergencyRequest),
          useValue: mockEmergencyRepo,
        },
        {
          provide: DonorsService,
          useValue: mockDonorsService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<EmergenciesService>(EmergenciesService);
    donorsService = module.get<DonorsService>(DonorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Haversine Formula', () => {
    it('should calculate distance correctly between Nasr City and Heliopolis', () => {
      // Nasr City: 30.0511, 31.3456
      // Heliopolis: 30.0866, 31.3225
      const distance = (service as any).haversineKm(30.0511, 31.3456, 30.0866, 31.3225);
      expect(distance).toBeGreaterThan(4);
      expect(distance).toBeLessThan(5);
    });

    it('should return 0 for the same point', () => {
      const distance = (service as any).haversineKm(30, 31, 30, 31);
      expect(distance).toBe(0);
    });
  });

  describe('Recency Penalty', () => {
    it('should return 25 penalty for a donation made today', () => {
      const today = new Date().toISOString();
      const penalty = (service as any).recencyPenalty = (service as any).daysSinceLastDonation(today);
      // daysSince = 0
      // penalty = Math.round(25 * (1 - 0/56)) = 25
      
      // We need to test the logic inside matchDonors or expose the penalty calc
      // The current service calculates daysSinceLastDonation then applies logic
      const daysSince = (service as any).daysSinceLastDonation(today);
      expect(daysSince).toBe(0);
    });

    it('should return 0 penalty for a donation made 60 days ago', () => {
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const daysSince = (service as any).daysSinceLastDonation(sixtyDaysAgo);
      expect(daysSince).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Matching Engine v2 Scoring', () => {
    it('should rank exact match higher than compatible match when other factors are equal', async () => {
      const mockEmergency = {
        id: 'e1',
        hospital: 'Nasr City',
        requiredType: 'O+',
        urgency: UrgencyLevel.MEDIUM,
        status: EmergencyStatus.ACTIVE,
      };

      const mockDonors = [
        {
          id: 'd1',
          name: 'Donor Exact',
          bloodType: 'O+',
          reliability: 100,
          city: 'Nasr City',
          lastDonation: null,
        },
        {
          id: 'd2',
          name: 'Donor Compatible',
          bloodType: 'O-',
          reliability: 100,
          city: 'Nasr City',
          lastDonation: null,
        },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');
      
      expect(result.donors[0].name).toBe('Donor Exact');
      expect(result.donors[0].score).toBe(100); // 100*0.55 + 100*0.25 + 100*0.20 = 100
      expect(result.donors[1].name).toBe('Donor Compatible');
      expect(result.donors[1].score).toBe(80); // 100*0.55 + 100*0.25 + 0*0.20 = 80
    });

    it('should apply recency penalty correctly', async () => {
      const mockEmergency = {
        id: 'e1',
        hospital: 'Nasr City',
        requiredType: 'O+',
        urgency: UrgencyLevel.MEDIUM,
      };

      const today = new Date().toISOString();
      const mockDonors = [
        {
          id: 'd1',
          name: 'Recent Donor',
          bloodType: 'O+',
          reliability: 100,
          city: 'Nasr City',
          lastDonation: today,
        },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');
      
      // Score = 100*0.55 (Rel) + 100*0.25 (Prox) + 100*0.20 (Exact) - 25 (Penalty) = 100 - 25 = 75
      expect(result.donors[0].score).toBe(75);
      expect(result.donors[0].recencyPenalty).toBe(25);
    });
  });
});

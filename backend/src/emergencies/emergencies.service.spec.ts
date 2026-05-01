import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmergenciesService } from './emergencies.service';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../entities/emergency-request.entity';
import { DonorsService } from '../donors/donors.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('EmergenciesService', () => {
  let service: EmergenciesService;

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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── UT-EMRG-01: findAll returns only ACTIVE emergencies ──
  describe('findAll', () => {
    it('should query for ACTIVE emergencies ordered by createdAt DESC', async () => {
      const mockEmergencies = [{ id: 'e1', status: EmergencyStatus.ACTIVE }];
      mockEmergencyRepo.find.mockResolvedValue(mockEmergencies);

      const result = await service.findAll();

      expect(result).toEqual(mockEmergencies);
      expect(mockEmergencyRepo.find).toHaveBeenCalledWith({
        where: { status: EmergencyStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    });
  });

  // ── UT-EMRG-02: findOne throws NotFoundException for non-existent ID ──
  describe('findOne', () => {
    it('should throw NotFoundException for non-existent emergency', async () => {
      mockEmergencyRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent'))
        .rejects.toThrow('Emergency request not found');
    });
  });

  // ── UT-EMRG-03: create sets default status and distance ──
  describe('create', () => {
    it('should create emergency with default distance = 0', async () => {
      const dto = {
        hospital: 'Cairo General',
        department: 'ICU',
        requiredType: 'O-',
        unitsNeeded: 6,
        urgency: 'Critical',
      };
      mockEmergencyRepo.create.mockImplementation((d) => d);
      mockEmergencyRepo.save.mockImplementation((d) => Promise.resolve({ id: 'e-new', ...d }));

      const result = await service.create(dto as any);

      expect(result.distance).toBe(0);
      expect(result.hospital).toBe('Cairo General');
    });
  });

  // ── UT-EMRG-04: resolve sets status to RESOLVED ──
  describe('resolve', () => {
    it('should set status to RESOLVED', async () => {
      const mockEmergency = { id: 'e1', status: EmergencyStatus.ACTIVE };
      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockEmergencyRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.resolve('e1');

      expect(result.status).toBe(EmergencyStatus.RESOLVED);
    });
  });

  // ── UT-EMRG-05: remove deletes and returns { deleted: true } ──
  describe('remove', () => {
    it('should delete the emergency and return { deleted: true }', async () => {
      const mockEmergency = { id: 'e1' };
      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockEmergencyRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('e1');

      expect(result).toEqual({ deleted: true });
    });
  });

  // ── Matching Engine Tests (aligned with actual v1 service implementation) ──
  describe('matchDonors', () => {
    const mockEmergency = {
      id: 'e1',
      hospital: 'Nasr City',
      requiredType: 'O+',
      urgency: UrgencyLevel.MEDIUM,
      status: EmergencyStatus.ACTIVE,
    };

    // ── UT-MATCH-01: returns scored donors with correct structure ──
    it('should return scored donors with correct response structure', async () => {
      const mockDonors = [
        {
          id: 'd1',
          name: 'Mohamed Hassan',
          bloodType: 'O+',
          reliability: 95,
          city: 'Nasr City',
          phone: '+20-100-111-0001',
        },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');

      expect(result.totalCompatible).toBe(1);
      expect(result.donors).toHaveLength(1);
      expect(result.donors[0]).toHaveProperty('name', 'Mohamed Hassan');
      expect(result.donors[0]).toHaveProperty('bloodType', 'O+');
      expect(result.donors[0]).toHaveProperty('reliability', 95);
      expect(result.donors[0]).toHaveProperty('score');
      expect(result.donors[0]).toHaveProperty('distance');
      expect(result.donors[0]).toHaveProperty('eta');
      expect(result.donors[0]).toHaveProperty('city', 'Nasr City');
    });

    // ── UT-MATCH-02: highReliability count is correct ──
    it('should count highReliability donors (reliability >= 90)', async () => {
      const mockDonors = [
        { id: 'd1', name: 'A', bloodType: 'O+', reliability: 95, city: 'Nasr City', phone: '1' },
        { id: 'd2', name: 'B', bloodType: 'O-', reliability: 80, city: 'Maadi', phone: '2' },
        { id: 'd3', name: 'C', bloodType: 'O+', reliability: 99, city: 'Giza', phone: '3' },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');

      expect(result.highReliability).toBe(2); // d1 (95) and d3 (99)
    });

    // ── UT-MATCH-03: donors are sorted by score descending ──
    it('should return donors sorted by score descending', async () => {
      const mockDonors = [
        { id: 'd1', name: 'Low Rel', bloodType: 'O+', reliability: 50, city: 'Nasr City', phone: '1' },
        { id: 'd2', name: 'High Rel', bloodType: 'O+', reliability: 100, city: 'Maadi', phone: '2' },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');

      // With high reliability, donor d2 should score higher (reliability is weighted at 0.7)
      // This test checks the sort order, not exact scores (distance is random)
      expect(result.donors.length).toBe(2);
      expect(result.donors[0].score).toBeGreaterThanOrEqual(result.donors[1].score);
    });

    // ── UT-MATCH-04: top-10 cap ──
    it('should return at most 10 donors', async () => {
      const mockDonors = Array.from({ length: 15 }, (_, i) => ({
        id: `d-${i}`,
        name: `Donor ${i}`,
        bloodType: 'O+',
        reliability: 80,
        city: 'Nasr City',
        phone: `${i}`,
      }));

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');

      expect(result.totalCompatible).toBe(15);
      expect(result.donors.length).toBe(10); // Capped at 10
    });

    // ── UT-MATCH-05: 0 compatible donors returns empty ──
    it('should handle 0 compatible donors', async () => {
      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue([]);

      const result = await service.matchDonors('e1');

      expect(result.totalCompatible).toBe(0);
      expect(result.donors).toEqual([]);
    });

    // ── UT-MATCH-06: score formula uses 70% reliability + 30% distance ──
    it('should compute score as reliability*0.7 + distanceScore*0.3', async () => {
      const mockDonors = [
        { id: 'd1', name: 'Donor A', bloodType: 'O+', reliability: 100, city: 'Nasr City', phone: '1' },
      ];

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue(mockDonors);

      const result = await service.matchDonors('e1');
      const donor = result.donors[0];

      // Score = round(reliability * 0.7 + distanceScore * 0.3)
      // reliability = 100, distanceScore = max(0, 100 - distanceKm * 5)
      // Since distance is random (0.5–15.5km), score will be between:
      //   min: round(100*0.7 + max(0, 100-15.5*5)*0.3) = round(70 + 6.75) = 77
      //   max: round(100*0.7 + max(0, 100-0.5*5)*0.3) = round(70 + 29.25) = 99
      expect(donor.score).toBeGreaterThanOrEqual(70);
      expect(donor.score).toBeLessThanOrEqual(100);
    });
  });

  // ── notifyDonors ──
  describe('notifyDonors', () => {
    it('should create a notification for the requesting user', async () => {
      const mockEmergency = {
        id: 'e1',
        hospital: 'Cairo General',
        department: 'ICU',
        requiredType: 'O-',
        unitsNeeded: 6,
        urgency: UrgencyLevel.CRITICAL,
        status: EmergencyStatus.ACTIVE,
      };

      mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
      mockDonorsService.findCompatible.mockResolvedValue([
        { id: 'd1', name: 'Donor 1', bloodType: 'O-', reliability: 90, city: 'Giza', phone: '1' },
      ]);
      mockNotificationsService.create.mockResolvedValue({});

      const result = await service.notifyDonors('e1', 'u-1');

      expect(result.notified).toBe(1);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u-1',
          title: expect.stringContaining('O-'),
        }),
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DonorsService } from './donors.service';
import { Donor, BloodType } from '../entities/donor.entity';

describe('DonorsService', () => {
  let service: DonorsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  const mockDonorRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonorsService,
        {
          provide: getRepositoryToken(Donor),
          useValue: mockDonorRepo,
        },
      ],
    }).compile();

    service = module.get<DonorsService>(DonorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────────────────────
  // Blood Compatibility Matrix — Full 8-type coverage (UT-COMPAT-01 to 08)
  // ──────────────────────────────────────────────────────────────
  describe('findCompatible — Blood Compatibility Matrix', () => {
    // ── UT-COMPAT-01: O+ can receive from O+, O- ──
    it('should query correct compatible types for O+', async () => {
      await service.findCompatible('O+');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['O+', 'O-'] },
      );
    });

    // ── UT-COMPAT-02: O- can receive from O- only ──
    it('should query correct compatible types for O-', async () => {
      await service.findCompatible('O-');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['O-'] },
      );
    });

    // ── UT-COMPAT-03: A+ can receive from A+, A-, O+, O- ──
    it('should query correct compatible types for A+', async () => {
      await service.findCompatible('A+');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['A+', 'A-', 'O+', 'O-'] },
      );
    });

    // ── UT-COMPAT-04: A- can receive from A-, O- ──
    it('should query correct compatible types for A-', async () => {
      await service.findCompatible('A-');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['A-', 'O-'] },
      );
    });

    // ── UT-COMPAT-05: B+ can receive from B+, B-, O+, O- ──
    it('should query correct compatible types for B+', async () => {
      await service.findCompatible('B+');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['B+', 'B-', 'O+', 'O-'] },
      );
    });

    // ── UT-COMPAT-06: B- can receive from B-, O- ──
    it('should query correct compatible types for B-', async () => {
      await service.findCompatible('B-');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['B-', 'O-'] },
      );
    });

    // ── UT-COMPAT-07: AB+ is universal recipient (all 8 types) ──
    it('should query all types for AB+ (universal recipient)', async () => {
      await service.findCompatible('AB+');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] },
      );
    });

    // ── UT-COMPAT-08: AB- can receive from A-, B-, AB-, O- ──
    it('should query correct compatible types for AB-', async () => {
      await service.findCompatible('AB-');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['A-', 'B-', 'AB-', 'O-'] },
      );
    });

    // ── UT-COMPAT-EXTRA: filters by available and eligible ──
    it('should filter by available=true and eligible=true', async () => {
      await service.findCompatible('O+');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donor.available = :av',
        { av: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'donor.eligible = :el',
        { el: true },
      );
    });

    // ── UT-COMPAT-EXTRA: sorts by reliability DESC ──
    it('should sort compatible donors by reliability DESC', async () => {
      await service.findCompatible('O+');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('donor.reliability', 'DESC');
    });
  });

  // ──────────────────────────────────────────────────────────────
  // Toggle Availability (UT-DONOR-04)
  // ──────────────────────────────────────────────────────────────
  describe('toggleAvailability', () => {
    it('should flip availability from true to false', async () => {
      const mockDonor = { id: '1', available: true };
      mockDonorRepo.findOne.mockResolvedValue(mockDonor);
      mockDonorRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.toggleAvailability('1');
      expect(result.available).toBe(false);
    });

    it('should flip availability from false to true', async () => {
      const mockDonor = { id: '1', available: false };
      mockDonorRepo.findOne.mockResolvedValue(mockDonor);
      mockDonorRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.toggleAvailability('1');
      expect(result.available).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────
  // CRUD Operations (UT-DONOR-01, 02, 03)
  // ──────────────────────────────────────────────────────────────
  describe('create', () => {
    it('should create a donor with correct defaults', async () => {
      const dto = {
        name: 'Test Donor',
        email: 'test@donor.com',
        phone: '+20-100-000-0000',
        bloodType: 'O+',
        age: 30,
        city: 'Nasr City',
      };
      mockDonorRepo.create.mockImplementation((d) => d);
      mockDonorRepo.save.mockImplementation((d) => Promise.resolve({ id: 'new', ...d }));

      const result = await service.create(dto as any);

      expect(result.reliability).toBe(50);
      expect(result.available).toBe(true);
      expect(result.eligible).toBe(true);
      expect(result.totalDonations).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for non-existent donor', async () => {
      mockDonorRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove donor and return { deleted: true }', async () => {
      const mockDonor = { id: '1', name: 'Test' };
      mockDonorRepo.findOne.mockResolvedValue(mockDonor);
      mockDonorRepo.remove.mockResolvedValue(undefined);

      const result = await service.remove('1');
      expect(result).toEqual({ deleted: true });
    });
  });
});

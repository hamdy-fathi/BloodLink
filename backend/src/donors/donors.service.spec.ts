import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
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

  describe('findCompatible', () => {
    it('should query correct compatible types for O+', async () => {
      await service.findCompatible('O+');

      // O+ can receive from O+, O-
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['O+', 'O-'] }
      );
    });

    it('should query correct compatible types for AB-', async () => {
      await service.findCompatible('AB-');

      // AB- can receive from A-, B-, AB-, O-
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['A-', 'B-', 'AB-', 'O-'] }
      );
    });

    it('should query all types for AB+ (universal recipient)', async () => {
      await service.findCompatible('AB+');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'donor."bloodType" IN (:...types)',
        { types: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] }
      );
    });
  });

  describe('toggleAvailability', () => {
    it('should flip availability status', async () => {
      const mockDonor = { id: '1', available: true };
      mockDonorRepo.findOne.mockResolvedValue(mockDonor);
      mockDonorRepo.save.mockImplementation((d) => Promise.resolve(d));

      const result = await service.toggleAvailability('1');
      expect(result.available).toBe(false);

      mockDonorRepo.findOne.mockResolvedValue({ id: '1', available: false });
      const result2 = await service.toggleAvailability('1');
      expect(result2.available).toBe(true);
    });
  });
});

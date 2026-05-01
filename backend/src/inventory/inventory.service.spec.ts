import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryService } from './inventory.service';
import { BloodInventory, InventoryStatus } from '../entities/blood-inventory.entity';

describe('InventoryService', () => {
  let service: InventoryService;

  const mockInvRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(BloodInventory),
          useValue: mockInvRepo,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatus', () => {
    it('should return CRITICAL for units <= 30', () => {
      expect((service as any).getStatus(15)).toBe(InventoryStatus.CRITICAL);
      expect((service as any).getStatus(30)).toBe(InventoryStatus.CRITICAL);
    });

    it('should return WARNING for units between 31 and 80', () => {
      expect((service as any).getStatus(31)).toBe(InventoryStatus.WARNING);
      expect((service as any).getStatus(50)).toBe(InventoryStatus.WARNING);
      expect((service as any).getStatus(80)).toBe(InventoryStatus.WARNING);
    });

    it('should return HEALTHY for units > 80', () => {
      expect((service as any).getStatus(81)).toBe(InventoryStatus.HEALTHY);
      expect((service as any).getStatus(100)).toBe(InventoryStatus.HEALTHY);
    });
  });

  describe('create', () => {
    it('should set critical=true if units <= 30', async () => {
      const dto = { type: 'O-', units: 10 };
      mockInvRepo.create.mockImplementation((d) => d);
      mockInvRepo.save.mockImplementation((d) => Promise.resolve({ id: '1', ...d }));

      const result = await service.create(dto as any);
      expect(result.critical).toBe(true);
      expect(result.status).toBe(InventoryStatus.CRITICAL);
    });

    it('should set critical=false if units > 30', async () => {
      const dto = { type: 'A+', units: 50 };
      mockInvRepo.create.mockImplementation((d) => d);
      mockInvRepo.save.mockImplementation((d) => Promise.resolve({ id: '2', ...d }));

      const result = await service.create(dto as any);
      expect(result.critical).toBe(false);
      expect(result.status).toBe(InventoryStatus.WARNING);
    });
  });
});

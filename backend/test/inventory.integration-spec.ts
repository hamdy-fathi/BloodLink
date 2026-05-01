import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';

import { InventoryController } from '../src/inventory/inventory.controller';
import { InventoryService } from '../src/inventory/inventory.service';
import { BloodInventory, InventoryStatus } from '../src/entities/blood-inventory.entity';

const mockJwtGuard = { canActivate: () => true };

describe('Inventory Workflow (Integration)', () => {
  let app: INestApplication<App>;

  const mockItems = [
    { id: 'inv-1', type: 'O+', units: 420, status: InventoryStatus.HEALTHY, critical: false },
    { id: 'inv-2', type: 'O-', units: 25, status: InventoryStatus.CRITICAL, critical: true },
  ];

  const mockQB = {
    andWhere: jest.fn().mockReturnThis(), orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockItems),
  };

  const mockInvRepo = {
    findOne: jest.fn(), create: jest.fn((d: any) => d),
    save: jest.fn((d: any) => Promise.resolve({ id: 'inv-new', ...d })),
    remove: jest.fn(), createQueryBuilder: jest.fn(() => mockQB),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [InventoryService, { provide: getRepositoryToken(BloodInventory), useValue: mockInvRepo }],
    }).overrideGuard(require('@nestjs/passport').AuthGuard('jwt')).useValue(mockJwtGuard).compile();

    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); mockQB.getMany.mockResolvedValue(mockItems); });

  it('IT-INV-01: GET /api/inventory — returns items', async () => {
    const res = await request(app.getHttpServer()).get('/api/inventory').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('IT-INV-02: GET /api/inventory?status=Critical — filters', async () => {
    mockQB.getMany.mockResolvedValue([mockItems[1]]);
    await request(app.getHttpServer()).get('/api/inventory?status=Critical').expect(200);
    expect(mockQB.andWhere).toHaveBeenCalled();
  });

  it('IT-INV-03: POST /api/inventory — creates CRITICAL for units=10', async () => {
    const res = await request(app.getHttpServer()).post('/api/inventory')
      .send({ type: 'B-', units: 10 }).expect(201);
    expect(res.body.status).toBe(InventoryStatus.CRITICAL);
    expect(res.body.critical).toBe(true);
  });

  it('IT-INV-04: POST /api/inventory — creates HEALTHY for units=200', async () => {
    const res = await request(app.getHttpServer()).post('/api/inventory')
      .send({ type: 'A+', units: 200 }).expect(201);
    expect(res.body.status).toBe(InventoryStatus.HEALTHY);
    expect(res.body.critical).toBe(false);
  });

  it('IT-INV-05: PATCH /api/inventory/:id — recalculates status', async () => {
    mockInvRepo.findOne.mockResolvedValue({ ...mockItems[0], units: 420 });
    const res = await request(app.getHttpServer()).patch('/api/inventory/inv-1')
      .send({ units: 20 }).expect(200);
    expect(res.body.status).toBe(InventoryStatus.CRITICAL);
    expect(res.body.critical).toBe(true);
  });

  it('IT-INV-06: DELETE /api/inventory/:id — deletes', async () => {
    mockInvRepo.findOne.mockResolvedValue(mockItems[0]);
    const res = await request(app.getHttpServer()).delete('/api/inventory/inv-1').expect(200);
    expect(res.body).toEqual({ deleted: true });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DonorsController } from '../src/donors/donors.controller';
import { DonorsService } from '../src/donors/donors.service';
import { Donor, BloodType } from '../src/entities/donor.entity';

const mockJwtGuard = { canActivate: () => true };

describe('Donors Workflow (Integration)', () => {
  let app: INestApplication<App>;

  const mockDonor = {
    id: 'd-1', name: 'Mohamed Hassan', email: 'mohamed@donor.com',
    phone: '+20-100-111-0001', bloodType: BloodType.O_POS, age: 30,
    city: 'Nasr City', reliability: 95, available: true, eligible: true, totalDonations: 12,
  };

  const mockQB = {
    where: jest.fn().mockReturnThis(), andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(), getMany: jest.fn().mockResolvedValue([mockDonor]),
  };

  const mockDonorRepo = {
    findOne: jest.fn(), create: jest.fn((d: any) => d),
    save: jest.fn((d: any) => Promise.resolve({ id: 'd-new', ...d })),
    remove: jest.fn(), createQueryBuilder: jest.fn(() => mockQB),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [DonorsController],
      providers: [DonorsService, { provide: getRepositoryToken(Donor), useValue: mockDonorRepo }],
    }).overrideGuard(require('@nestjs/passport').AuthGuard('jwt')).useValue(mockJwtGuard).compile();

    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); mockQB.getMany.mockResolvedValue([mockDonor]); });

  it('IT-DONOR-01: GET /api/donors — returns donors', async () => {
    const res = await request(app.getHttpServer()).get('/api/donors').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('IT-DONOR-02: GET /api/donors?bloodType=O+ — filters', async () => {
    await request(app.getHttpServer()).get('/api/donors?bloodType=O%2B').expect(200);
    expect(mockQB.andWhere).toHaveBeenCalled();
  });

  it('IT-DONOR-03: GET /api/donors?search=Mohamed — searches', async () => {
    await request(app.getHttpServer()).get('/api/donors?search=Mohamed').expect(200);
    expect(mockQB.andWhere).toHaveBeenCalled();
  });

  it('IT-DONOR-04: POST /api/donors — creates with defaults', async () => {
    const res = await request(app.getHttpServer()).post('/api/donors')
      .send({ name: 'New Donor', email: 'new@d.com', phone: '+201002', bloodType: 'A+', age: 25, city: 'Maadi' })
      .expect(201);
    expect(res.body.reliability).toBe(50);
    expect(res.body.available).toBe(true);
  });

  it('IT-DONOR-05: PATCH /api/donors/:id/toggle-availability — toggles', async () => {
    mockDonorRepo.findOne.mockResolvedValue({ ...mockDonor, available: true });
    const res = await request(app.getHttpServer()).patch('/api/donors/d-1/toggle-availability').expect(200);
    expect(res.body.available).toBe(false);
  });

  it('IT-DONOR-06: DELETE /api/donors/:id — deletes', async () => {
    mockDonorRepo.findOne.mockResolvedValue(mockDonor);
    const res = await request(app.getHttpServer()).delete('/api/donors/d-1').expect(200);
    expect(res.body).toEqual({ deleted: true });
  });
});

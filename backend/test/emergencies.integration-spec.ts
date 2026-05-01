import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmergencyRequest, EmergencyStatus } from '../src/entities/emergency-request.entity';
import { Donor } from '../src/entities/donor.entity';

describe('Emergency Workflow (Integration)', () => {
  let app: INestApplication;

  // We mock the repositories to avoid needing a live PostgreSQL database for integration tests in CI
  const mockEmergencyRepo = {
    save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'test-uuid', ...dto, status: EmergencyStatus.ACTIVE })),
    findOne: jest.fn().mockResolvedValue({
      id: 'test-uuid',
      hospital: 'Nasr City',
      requiredType: 'O-',
      unitsNeeded: 5,
      urgency: 'Critical',
      status: EmergencyStatus.ACTIVE,
    }),
  };

  const mockDonorRepo = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 'd1', name: 'Test Donor', bloodType: 'O-', reliability: 90, city: 'Nasr City', available: true, eligible: true },
      ]),
    })),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(EmergencyRequest))
      .useValue(mockEmergencyRepo)
      .overrideProvider(getRepositoryToken(Donor))
      .useValue(mockDonorRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/emergencies - Should create a new emergency request', () => {
    return request(app.getHttpServer())
      .post('/api/emergencies')
      .send({
        hospital: 'Qasr Al-Ainy',
        department: 'Trauma',
        requiredType: 'O-',
        unitsNeeded: 10,
        urgency: 'Critical',
      })
      .expect(201)
      .then((response) => {
        expect(response.body.id).toBe('test-uuid');
        expect(response.body.requiredType).toBe('O-');
      });
  });

  it('GET /api/emergencies/:id/match - Should run matching engine and return scored donors', () => {
    return request(app.getHttpServer())
      .get('/api/emergencies/test-uuid/match')
      .expect(200)
      .then((response) => {
        expect(response.body.algorithm).toContain('BloodLink Matching Engine');
        expect(response.body.donors.length).toBeGreaterThan(0);
        expect(response.body.donors[0].bloodType).toBe('O-');
        expect(response.body.donors[0].score).toBeDefined();
      });
  });

  it('PATCH /api/emergencies/:id/resolve - Should mark request as resolved', () => {
    return request(app.getHttpServer())
      .patch('/api/emergencies/test-uuid/resolve')
      .expect(200)
      .then((response) => {
        expect(response.body.status).toBe(EmergencyStatus.RESOLVED);
      });
  });
});

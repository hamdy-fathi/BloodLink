import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';

import { EmergenciesController } from '../src/emergencies/emergencies.controller';
import { EmergenciesService } from '../src/emergencies/emergencies.service';
import { DonorsService } from '../src/donors/donors.service';
import { NotificationsService } from '../src/notifications/notifications.service';
import { EmergencyRequest, EmergencyStatus, UrgencyLevel } from '../src/entities/emergency-request.entity';
import { Donor } from '../src/entities/donor.entity';
import { Notification } from '../src/entities/notification.entity';

// Mock JWT guard — injects user context for protected routes
const mockJwtGuard = {
  canActivate: (context: any) => {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u-1', email: 'admin@bloodlink.org', role: 'admin' };
    return true;
  },
};

/**
 * IT-EMRG: Integration tests for the Emergencies module
 * Tests the full emergency lifecycle via HTTP:
 * Create → Match → Notify → Resolve → Delete
 */
describe('Emergency Workflow (Integration)', () => {
  let app: INestApplication<App>;

  const mockEmergency = {
    id: 'e-1', hospital: 'Cairo General', department: 'ICU',
    requiredType: 'O-', unitsNeeded: 6, urgency: UrgencyLevel.CRITICAL,
    status: EmergencyStatus.ACTIVE, distance: 0, createdAt: new Date(),
  };

  const mockDonors = [
    { id: 'd1', name: 'Test Donor A', bloodType: 'O-', reliability: 95, city: 'Nasr City', phone: '+201001', available: true, eligible: true },
    { id: 'd2', name: 'Test Donor B', bloodType: 'O-', reliability: 80, city: 'Maadi', phone: '+201002', available: true, eligible: true },
  ];

  const mockEmergencyRepo = {
    find: jest.fn().mockResolvedValue([mockEmergency]),
    findOne: jest.fn(),
    create: jest.fn((d: any) => d),
    save: jest.fn((d: any) => Promise.resolve({ id: 'e-new', ...d })),
    remove: jest.fn(),
  };

  const mockDonorQB = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue(mockDonors),
  };
  const mockDonorRepo = { createQueryBuilder: jest.fn(() => mockDonorQB) };

  const mockNotifRepo = {
    create: jest.fn((d: any) => d),
    save: jest.fn((d: any) => Promise.resolve({ id: 'n-1', ...d })),
  };

  beforeAll(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      controllers: [EmergenciesController],
      providers: [
        EmergenciesService, DonorsService, NotificationsService,
        { provide: getRepositoryToken(EmergencyRequest), useValue: mockEmergencyRepo },
        { provide: getRepositoryToken(Donor), useValue: mockDonorRepo },
        { provide: getRepositoryToken(Notification), useValue: mockNotifRepo },
      ],
    })
      .overrideGuard(require('@nestjs/passport').AuthGuard('jwt'))
      .useValue(mockJwtGuard)
      .compile();

    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockEmergencyRepo.findOne.mockResolvedValue(mockEmergency);
    mockDonorQB.getMany.mockResolvedValue(mockDonors);
  });

  // IT-EMRG-01
  it('GET /api/emergencies — returns active emergencies', async () => {
    const res = await request(app.getHttpServer()).get('/api/emergencies').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockEmergencyRepo.find).toHaveBeenCalledWith({
      where: { status: EmergencyStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  });

  // IT-EMRG-02
  it('POST /api/emergencies — creates with distance=0', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/emergencies')
      .send({ hospital: 'Qasr Al-Ainy', department: 'Trauma', requiredType: 'O-', unitsNeeded: 10, urgency: 'Critical' })
      .expect(201);
    expect(res.body.hospital).toBe('Qasr Al-Ainy');
    expect(res.body.distance).toBe(0);
  });

  // IT-EMRG-03
  it('GET /api/emergencies/:id/match — returns scored donors', async () => {
    const res = await request(app.getHttpServer()).get('/api/emergencies/e-1/match').expect(200);
    expect(res.body.totalCompatible).toBe(2);
    expect(res.body.donors.length).toBeGreaterThan(0);
    expect(res.body.donors[0]).toHaveProperty('score');
    expect(res.body.donors[0]).toHaveProperty('distance');
  });

  // IT-EMRG-04
  it('POST /api/emergencies/:id/notify — creates notification', async () => {
    const res = await request(app.getHttpServer()).post('/api/emergencies/e-1/notify').expect(201);
    expect(res.body.notified).toBeGreaterThan(0);
    expect(mockNotifRepo.create).toHaveBeenCalled();
  });

  // IT-EMRG-05
  it('PATCH /api/emergencies/:id/resolve — sets RESOLVED', async () => {
    const res = await request(app.getHttpServer()).patch('/api/emergencies/e-1/resolve').expect(200);
    expect(res.body.status).toBe(EmergencyStatus.RESOLVED);
  });

  // IT-EMRG-06
  it('DELETE /api/emergencies/:id — removes', async () => {
    const res = await request(app.getHttpServer()).delete('/api/emergencies/e-1').expect(200);
    expect(res.body).toEqual({ deleted: true });
  });
});

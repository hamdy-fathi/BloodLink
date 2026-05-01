import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';

import { NotificationsController } from '../src/notifications/notifications.controller';
import { NotificationsService } from '../src/notifications/notifications.service';
import { Notification, NotificationType, DonorResponse } from '../src/entities/notification.entity';

const mockJwtGuard = {
  canActivate: (context: any) => {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'u-1', email: 'admin@bloodlink.org', role: 'admin' };
    return true;
  },
};

describe('Notifications Workflow (Integration)', () => {
  let app: INestApplication<App>;

  const mockNotif = {
    id: 'n-1', type: NotificationType.EMERGENCY,
    title: 'Emergency: O- Needed', message: 'ICU requires 6 units.',
    timestamp: new Date(), read: false, response: DonorResponse.PENDING, userId: 'u-1',
  };

  const mockQB = {
    update: jest.fn().mockReturnThis(), set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(), from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(), execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockNotifRepo = {
    find: jest.fn().mockResolvedValue([mockNotif]),
    findOne: jest.fn(),
    create: jest.fn((d: any) => d),
    save: jest.fn((d: any) => Promise.resolve(d)),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQB),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [NotificationsService, { provide: getRepositoryToken(Notification), useValue: mockNotifRepo }],
    }).overrideGuard(require('@nestjs/passport').AuthGuard('jwt')).useValue(mockJwtGuard).compile();

    app = mod.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); mockNotifRepo.findOne.mockResolvedValue({ ...mockNotif }); });

  it('IT-NOTIF-01: GET /api/notifications — returns user notifications', async () => {
    const res = await request(app.getHttpServer()).get('/api/notifications').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(mockNotifRepo.find).toHaveBeenCalledWith({
      where: { userId: 'u-1' }, order: { timestamp: 'DESC' },
    });
  });

  it('IT-NOTIF-02: PATCH /api/notifications/:id/read — marks as read', async () => {
    const res = await request(app.getHttpServer()).patch('/api/notifications/n-1/read').expect(200);
    expect(res.body.read).toBe(true);
  });

  it('IT-NOTIF-03: PATCH /api/notifications/read-all — marks all read', async () => {
    const res = await request(app.getHttpServer()).patch('/api/notifications/read-all').expect(200);
    expect(res.body).toEqual({ success: true });
  });

  it('IT-NOTIF-04: DELETE /api/notifications/:id — dismisses', async () => {
    const res = await request(app.getHttpServer()).delete('/api/notifications/n-1').expect(200);
    expect(res.body).toEqual({ deleted: true });
  });

  it('IT-NOTIF-05: DELETE /api/notifications/clear-all — clears all', async () => {
    const res = await request(app.getHttpServer()).delete('/api/notifications/clear-all').expect(200);
    expect(res.body).toEqual({ deleted: true });
  });
});

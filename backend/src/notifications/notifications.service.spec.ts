import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType, DonorResponse } from '../entities/notification.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotif: Notification = {
    id: 'n-1',
    type: NotificationType.EMERGENCY,
    title: 'Emergency: O- Needed',
    message: 'Trauma Unit requires 6 units of O- immediately.',
    timestamp: new Date(),
    read: false,
    response: DonorResponse.PENDING,
    userId: 'u-1',
    user: null as any,
  };

  const mockQueryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockNotifRepo = {
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
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotifRepo },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── IT-NOTIF-01: findAllForUser returns notifications ordered by timestamp DESC ──
  describe('findAllForUser', () => {
    it('should return notifications for a specific user', async () => {
      const mockNotifs = [mockNotif];
      mockNotifRepo.find.mockResolvedValue(mockNotifs);

      const result = await service.findAllForUser('u-1');

      expect(result).toEqual(mockNotifs);
      expect(mockNotifRepo.find).toHaveBeenCalledWith({
        where: { userId: 'u-1' },
        order: { timestamp: 'DESC' },
      });
    });
  });

  // ── IT-NOTIF-02: markAsRead sets read = true ──
  describe('markAsRead', () => {
    it('should set read to true', async () => {
      const notif = { ...mockNotif, read: false };
      mockNotifRepo.findOne.mockResolvedValue(notif);
      mockNotifRepo.save.mockImplementation((n) => Promise.resolve(n));

      const result = await service.markAsRead('n-1');

      expect(result.read).toBe(true);
    });

    it('should throw NotFoundException for non-existent notification', async () => {
      mockNotifRepo.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── IT-NOTIF-03: markAllReadForUser bulk updates ──
  describe('markAllReadForUser', () => {
    it('should return success after bulk update', async () => {
      const result = await service.markAllReadForUser('u-1');

      expect(result).toEqual({ success: true });
      expect(mockQueryBuilder.update).toHaveBeenCalled();
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ read: true });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id = :userId', { userId: 'u-1' });
    });
  });

  // ── IT-NOTIF-04: dismiss removes a single notification ──
  describe('dismiss', () => {
    it('should remove the notification and return { deleted: true }', async () => {
      mockNotifRepo.findOne.mockResolvedValue(mockNotif);
      mockNotifRepo.remove.mockResolvedValue(undefined);

      const result = await service.dismiss('n-1');

      expect(result).toEqual({ deleted: true });
      expect(mockNotifRepo.remove).toHaveBeenCalledWith(mockNotif);
    });

    it('should throw NotFoundException for non-existent notification', async () => {
      mockNotifRepo.findOne.mockResolvedValue(null);

      await expect(service.dismiss('non-existent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ── IT-NOTIF-05: clearAllForUser removes all for user ──
  describe('clearAllForUser', () => {
    it('should delete all notifications for user', async () => {
      const result = await service.clearAllForUser('u-1');

      expect(result).toEqual({ deleted: true });
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id = :userId', { userId: 'u-1' });
    });
  });

  // ── Extra: create notification ──
  describe('create', () => {
    it('should create and save a notification', async () => {
      const data = {
        type: NotificationType.EMERGENCY,
        title: 'Test',
        message: 'Test message',
        userId: 'u-1',
        read: false,
      };
      mockNotifRepo.create.mockReturnValue({ id: 'n-new', ...data });
      mockNotifRepo.save.mockImplementation((n) => Promise.resolve(n));

      const result = await service.create(data);

      expect(result.title).toBe('Test');
      expect(mockNotifRepo.create).toHaveBeenCalledWith(data);
    });
  });
});

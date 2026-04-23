import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async findAllForUser(userId: string) {
    return this.notifRepo.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.read = true;
    return this.notifRepo.save(notif);
  }

  async markAllReadForUser(userId: string) {
    await this.notifRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('user_id = :userId', { userId })
      .execute();
    return { success: true };
  }

  async dismiss(id: string) {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    await this.notifRepo.remove(notif);
    return { deleted: true };
  }

  async clearAllForUser(userId: string) {
    await this.notifRepo
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('user_id = :userId', { userId })
      .execute();
    return { deleted: true };
  }

  async create(data: Partial<Notification>) {
    const notif = this.notifRepo.create(data);
    return this.notifRepo.save(notif);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, DonorResponse, NotificationType } from '../entities/notification.entity.js';
import { Donor } from '../entities/donor.entity.js';
import { User, UserRole } from '../entities/user.entity.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
    @InjectRepository(Donor)
    private readonly donorRepo: Repository<Donor>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly auditService: AuditService,
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

  async respond(id: string, response: DonorResponse) {
    const notif = await this.notifRepo.findOne({ where: { id }, relations: ['user'] });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.response = response;
    notif.read = true;
    const saved = await this.notifRepo.save(notif);

    if (response === DonorResponse.ACCEPTED && notif.type === NotificationType.EMERGENCY) {
      // Find the donor by user email
      const donor = await this.donorRepo.findOne({ where: { email: notif.user.email } });
      if (donor) {
        // Toggle donor availability so they aren't matched again
        donor.available = false;
        await this.donorRepo.save(donor);

        // Find an admin or staff user to notify
        const staffUser = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
        if (staffUser) {
          // Extract hospital from notification message using a simple regex or assumption
          const hospitalMatch = notif.message.match(/at (.*?)(?=\s*\()/);
          const hospitalName = hospitalMatch ? hospitalMatch[1].trim() : 'the hospital';
          
          await this.notifRepo.save(this.notifRepo.create({
            type: NotificationType.SYSTEM,
            title: 'Donor En Route',
            message: `Donor ${donor.name} (${donor.bloodType}) has accepted the emergency request and is en route to ${hospitalName}.`,
            userId: staffUser.id,
            read: false,
          }));
        }

        await this.auditService.log(
          AuditAction.UPDATE, AuditEntity.DONOR, donor.id,
          notif.user.id, notif.user.name,
          `Donor accepted emergency request and is now en route`
        );
      }
    }

    return saved;
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

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity.js';
import { Donor, BloodType } from '../entities/donor.entity.js';
import { BloodInventory, InventoryStatus } from '../entities/blood-inventory.entity.js';
import { Notification, NotificationType } from '../entities/notification.entity.js';
import { EmergencyRequest, UrgencyLevel } from '../entities/emergency-request.entity.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Donor) private readonly donorRepo: Repository<Donor>,
    @InjectRepository(BloodInventory) private readonly invRepo: Repository<BloodInventory>,
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(EmergencyRequest) private readonly emergRepo: Repository<EmergencyRequest>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded. Skipping.');
      return;
    }

    this.logger.log('🌱 Seeding database...');

    // ── Users ──
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedStaff = await bcrypt.hash('staff123', 10);
    const hashedManager = await bcrypt.hash('manager123', 10);
    const hashedDonor = await bcrypt.hash('donor123', 10);

    const users = await this.userRepo.save([
      {
        name: 'Dr. Ahmed Fathi',
        email: 'admin@bloodlink.org',
        phone: '+20-100-900-1001',
        password: hashedAdmin,
        role: UserRole.ADMIN,
        avatar: 'AF',
        hospital: 'National Blood Bank of Egypt',
        joinedAt: new Date('2024-01-15'),
      },
      {
        name: 'Nurse Salma Nour',
        email: 'staff@qasr.org',
        phone: '+20-112-300-2002',
        password: hashedStaff,
        role: UserRole.STAFF,
        avatar: 'SN',
        hospital: 'Qasr Al-Ainy Hospital',
        joinedAt: new Date('2025-03-10'),
      },
      {
        name: 'Dr. Hana Mostafa',
        email: 'manager@dar-elfouad.org',
        phone: '+20-128-500-3003',
        password: hashedManager,
        role: UserRole.MANAGER,
        avatar: 'HM',
        hospital: 'Dar El Fouad Hospital',
        joinedAt: new Date('2024-08-22'),
      },
      {
        name: 'Mohamed Tarek',
        email: 'donor@bloodlink.org',
        phone: '+20-100-555-0101',
        password: hashedDonor,
        role: UserRole.DONOR,
        avatar: 'MT',
        hospital: '',
        joinedAt: new Date('2025-06-01'),
      },
    ]);

    this.logger.log(`✅ Seeded ${users.length} users`);

    // ── Donors ──
    const donors = await this.donorRepo.save([
      { name: 'Mohamed Tarek', email: 'donor@bloodlink.org', phone: '+20-100-555-0101', bloodType: BloodType.O_NEG, age: 32, lastDonation: '2026-03-10', totalDonations: 14, reliability: 98, available: true, city: 'Nasr City', eligible: true },
      { name: 'Sara El-Sayed', email: 'sara.elsayed@mail.com', phone: '+20-112-555-0102', bloodType: BloodType.A_POS, age: 28, lastDonation: '2026-02-22', totalDonations: 8, reliability: 95, available: true, city: 'Zamalek', eligible: true },
      { name: 'Youssef Kamal', email: 'ykamal@mail.com', phone: '+20-128-555-0103', bloodType: BloodType.O_POS, age: 41, lastDonation: '2026-01-15', totalDonations: 22, reliability: 82, available: false, city: 'Heliopolis', eligible: true },
      { name: 'Nour Hassan', email: 'nhassan@mail.com', phone: '+20-100-555-0104', bloodType: BloodType.B_POS, age: 35, lastDonation: '2026-03-28', totalDonations: 5, reliability: 90, available: true, city: 'Maadi', eligible: false },
      { name: 'Omar Abdelrahman', email: 'omar.a@mail.com', phone: '+20-112-555-0105', bloodType: BloodType.AB_NEG, age: 50, lastDonation: '2025-12-01', totalDonations: 30, reliability: 99, available: true, city: 'Dokki', eligible: true },
      { name: 'Laila Mahmoud', email: 'lmahmoud@mail.com', phone: '+20-128-555-0106', bloodType: BloodType.A_NEG, age: 26, lastDonation: '2026-03-05', totalDonations: 3, reliability: 75, available: true, city: '6th of October City', eligible: true },
      { name: 'Ahmed Mostafa', email: 'a.mostafa@mail.com', phone: '+20-100-555-0107', bloodType: BloodType.O_POS, age: 38, lastDonation: '2026-02-14', totalDonations: 18, reliability: 88, available: false, city: 'Mohandessin', eligible: true },
      { name: 'Aya Hesham', email: 'ayah@mail.com', phone: '+20-112-555-0108', bloodType: BloodType.B_NEG, age: 29, lastDonation: '2026-03-20', totalDonations: 7, reliability: 92, available: true, city: 'New Cairo', eligible: true },
    ]);

    this.logger.log(`✅ Seeded ${donors.length} donors`);

    // ── Blood Inventory ──
    const inventory = await this.invRepo.save([
      { type: 'O+', units: 420, status: InventoryStatus.HEALTHY, trend: '+5%', critical: false, expiringIn48h: 12 },
      { type: 'O-', units: 85, status: InventoryStatus.CRITICAL, trend: '-12%', critical: true, expiringIn48h: 3 },
      { type: 'A+', units: 310, status: InventoryStatus.HEALTHY, trend: '+2%', critical: false, expiringIn48h: 8 },
      { type: 'A-', units: 45, status: InventoryStatus.WARNING, trend: '-8%', critical: false, expiringIn48h: 2 },
      { type: 'B+', units: 190, status: InventoryStatus.HEALTHY, trend: '+1%', critical: false, expiringIn48h: 5 },
      { type: 'B-', units: 30, status: InventoryStatus.WARNING, trend: '-4%', critical: false, expiringIn48h: 1 },
      { type: 'AB+', units: 120, status: InventoryStatus.HEALTHY, trend: '+8%', critical: false, expiringIn48h: 4 },
      { type: 'AB-', units: 15, status: InventoryStatus.CRITICAL, trend: '-20%', critical: true, expiringIn48h: 0 },
    ]);

    this.logger.log(`✅ Seeded ${inventory.length} inventory items`);

    // ── Notifications (all for admin user) ──
    const adminUser = users[0];
    const notifications = await this.notifRepo.save([
      { type: NotificationType.EMERGENCY, title: 'Emergency: O- Needed', message: 'Trauma Unit at Qasr Al-Ainy Hospital requires 6 units of O- immediately.', read: false, userId: adminUser.id },
      { type: NotificationType.SHORTAGE, title: 'AB- Critical Shortage', message: 'AB- stock is below 10% safety threshold across all Cairo facilities.', read: false, userId: adminUser.id },
      { type: NotificationType.DONATION, title: 'Donation Completed', message: 'Mohamed Tarek completed a successful O- donation at Nasr City Blood Center.', read: false, userId: adminUser.id },
      { type: NotificationType.TRANSFER, title: 'Transfer Dispatched', message: '12 units of AB- dispatched to Ain Shams Specialized Hospital. ETA 15 min.', read: true, userId: adminUser.id },
      { type: NotificationType.SYSTEM, title: 'System Maintenance', message: 'Scheduled maintenance window tonight 02:00–04:00 (Cairo Time).', read: true, userId: adminUser.id },
      { type: NotificationType.SHORTAGE, title: 'B- Warning Level', message: 'B- inventory dropped to warning level (30 units) at Alexandria Regional Bank.', read: true, userId: adminUser.id },
      { type: NotificationType.DONATION, title: 'New Donor Registered', message: 'Aya Hesham registered as a B- donor in Zamalek, Cairo.', read: true, userId: adminUser.id },
    ]);

    this.logger.log(`✅ Seeded ${notifications.length} notifications`);

    // ── Emergency Requests ──
    const emergencies = await this.emergRepo.save([
      { hospital: 'Qasr Al-Ainy Hospital', department: 'Trauma Unit', requiredType: 'O-', unitsNeeded: 6, urgency: UrgencyLevel.CRITICAL, distance: 3.8 },
      { hospital: 'Ain Shams Specialized Hospital', department: 'Surgery', requiredType: 'A+', unitsNeeded: 4, urgency: UrgencyLevel.HIGH, distance: 8.2 },
      { hospital: 'Dar El Fouad Hospital', department: 'Maternity', requiredType: 'AB-', unitsNeeded: 2, urgency: UrgencyLevel.MEDIUM, distance: 12.5 },
    ]);

    this.logger.log(`✅ Seeded ${emergencies.length} emergency requests`);
    this.logger.log('🌱 Database seeding complete!');
  }
}

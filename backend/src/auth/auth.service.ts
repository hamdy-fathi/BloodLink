import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity.js';
import { Donor } from '../entities/donor.entity.js';
import { AuditService } from '../audit/audit.service.js';
import { AuditAction, AuditEntity } from '../entities/audit-log.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Donor)
    private readonly donorRepo: Repository<Donor>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    await this.auditService.log(
      AuditAction.LOGIN, AuditEntity.USER, user.id,
      user.id, user.name,
      `User "${user.name}" (${user.role}) logged in`,
    );

    return {
      access_token: token,
      user: this.sanitize(user),
    };
  }

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    bloodType: string;
    age: number;
    city: string;
  }) {
    // Check if email already exists
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user account
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: UserRole.DONOR,
      avatar: data.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
      hospital: '',
    });
    const savedUser = await this.userRepo.save(user);

    // Create donor record
    const donor = this.donorRepo.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      bloodType: data.bloodType as any,
      age: data.age,
      city: data.city,
      lastDonation: new Date().toISOString().slice(0, 10),
      totalDonations: 0,
      reliability: 50,
      available: true,
      eligible: true,
    });
    await this.donorRepo.save(donor);

    // Auto-login: return JWT
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const token = this.jwtService.sign(payload);

    await this.auditService.log(
      AuditAction.REGISTER, AuditEntity.USER, savedUser.id,
      savedUser.id, savedUser.name,
      `New donor "${savedUser.name}" registered (${data.bloodType}, ${data.city})`,
    );

    return {
      access_token: token,
      user: this.sanitize(savedUser),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found.');
    return this.sanitize(user);
  }

  private sanitize(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      hospital: user.hospital,
      joinedAt: user.joinedAt,
    };
  }
}


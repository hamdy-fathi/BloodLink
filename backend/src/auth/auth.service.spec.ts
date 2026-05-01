import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';

// Mock bcrypt at the module level (bcrypt.compare is non-configurable)
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 'u-1',
    name: 'Dr. Ahmed Fathi',
    email: 'admin@bloodlink.org',
    phone: '+20-100-900-1001',
    password: '$2b$10$hashedpassword', // bcrypt hash
    role: UserRole.ADMIN,
    avatar: 'AF',
    hospital: 'National Blood Bank of Egypt',
    joinedAt: new Date('2024-01-15'),
    notifications: [],
  };

  const mockUserRepo = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── UT-AUTH-01: Login with valid credentials ──
  describe('login — valid credentials', () => {
    it('should return access_token and sanitized user (no password)', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('admin@bloodlink.org', 'admin123');

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('admin@bloodlink.org');
      expect(result.user.name).toBe('Dr. Ahmed Fathi');
      // Ensure password is NOT in the sanitized response
      expect((result.user as any).password).toBeUndefined();
    });
  });

  // ── UT-AUTH-02: Login with wrong password ──
  describe('login — wrong password', () => {
    it('should throw UnauthorizedException', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('admin@bloodlink.org', 'wrongpass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ── UT-AUTH-03: Login with non-existent email ──
  describe('login — non-existent email', () => {
    it('should throw UnauthorizedException', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login('nobody@mail.com', 'pass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ── UT-AUTH-06: Password stored as bcrypt hash (not plaintext) ──
  describe('password hashing', () => {
    it('should compare using bcrypt, not plaintext', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('admin@bloodlink.org', 'admin123');

      expect(bcrypt.compare).toHaveBeenCalledWith('admin123', mockUser.password);
    });
  });

  // ── UT-AUTH-07: JWT payload contains sub, email, role ──
  describe('JWT payload', () => {
    it('should sign token with sub, email, and role', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login('admin@bloodlink.org', 'admin123');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 'u-1',
        email: 'admin@bloodlink.org',
        role: UserRole.ADMIN,
      });
    });
  });

  // ── UT-AUTH-04: getProfile returns sanitized user ──
  describe('getProfile', () => {
    it('should return sanitized user without password', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('u-1');

      expect(result.id).toBe('u-1');
      expect(result.email).toBe('admin@bloodlink.org');
      expect((result as any).password).toBeUndefined();
    });

    // ── UT-AUTH-05: getProfile with non-existent user ──
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});

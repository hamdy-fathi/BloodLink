import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { User, UserRole } from '../src/entities/user.entity';

const createMockJwtGuard = (jwtService: JwtService) => ({
  canActivate: (context: any) => {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) return false;
    try {
      const token = auth.replace('Bearer ', '');
      const payload = jwtService.verify(token);
      req.user = { userId: payload.sub, email: payload.email, role: payload.role };
      return true;
    } catch { return false; }
  },
});

describe('Auth Workflow (Integration)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  const hashedPassword = bcrypt.hashSync('admin123', 10);

  const mockAdmin: User = {
    id: 'u-1', name: 'Dr. Ahmed Fathi', email: 'admin@bloodlink.org',
    phone: '+20-100-900-1001', password: hashedPassword,
    role: UserRole.ADMIN, avatar: 'AF', hospital: 'National Blood Bank of Egypt',
    joinedAt: new Date('2024-01-15'), notifications: [],
  };

  const mockUserRepo = { findOne: jest.fn() };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [AuthController],
      providers: [AuthService, { provide: getRepositoryToken(User), useValue: mockUserRepo }],
    }).compile();
    jwtService = mod.get<JwtService>(JwtService);

    const modWithGuard = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      controllers: [AuthController],
      providers: [AuthService, { provide: getRepositoryToken(User), useValue: mockUserRepo }],
    }).overrideGuard(AuthGuard('jwt')).useValue(createMockJwtGuard(jwtService)).compile();

    app = modWithGuard.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    jwtService = modWithGuard.get<JwtService>(JwtService);
  });

  afterAll(async () => { await app.close(); });
  beforeEach(() => { jest.clearAllMocks(); });

  it('IT-AUTH-01: POST /api/auth/login — returns JWT and sanitized user', async () => {
    mockUserRepo.findOne.mockResolvedValue(mockAdmin);
    const res = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: 'admin@bloodlink.org', password: 'admin123' }).expect(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.user.email).toBe('admin@bloodlink.org');
    expect(res.body.user.password).toBeUndefined();
  });

  it('IT-AUTH-02: POST /api/auth/login — 401 for wrong password', async () => {
    mockUserRepo.findOne.mockResolvedValue(mockAdmin);
    await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: 'admin@bloodlink.org', password: 'wrong' }).expect(401);
  });

  it('IT-AUTH-03: POST /api/auth/login — 401 for unknown email', async () => {
    mockUserRepo.findOne.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: 'nobody@mail.com', password: 'pass' }).expect(401);
  });

  it('IT-AUTH-04: GET /api/auth/me — returns profile with valid JWT', async () => {
    mockUserRepo.findOne.mockResolvedValue(mockAdmin);
    const token = jwtService.sign({ sub: 'u-1', email: 'admin@bloodlink.org', role: 'admin' });
    const res = await request(app.getHttpServer())
      .get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.email).toBe('admin@bloodlink.org');
    expect(res.body.password).toBeUndefined();
  });

  it('IT-AUTH-05: GET /api/auth/me — 403 without token', async () => {
    await request(app.getHttpServer()).get('/api/auth/me').expect(403);
  });
});

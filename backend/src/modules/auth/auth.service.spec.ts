import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './enums/role.enum';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      verifyPassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      usersService.create.mockResolvedValue(mockUserWithoutPassword);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      configService.get.mockReturnValue('secret');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(usersService.findById).toHaveBeenCalledWith(mockUserWithoutPassword.id);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should throw error if user creation fails', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.create.mockRejectedValue(new Error('User creation failed'));

      await expect(service.register(registerDto)).rejects.toThrow('User creation failed');
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.verifyPassword.mockResolvedValue(true);
      jwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      configService.get.mockReturnValue('secret');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: mockUserWithoutPassword,
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(usersService.verifyPassword).toHaveBeenCalledWith(mockUser, loginDto.password);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.verifyPassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockRejectedValue(new Error('User not found'));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Login failed due to unknown reason');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = { sub: 1, email: 'test@example.com' };

      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new_access_token');
      configService.get.mockReturnValue('secret');

      const result = await service.refreshToken(refreshToken);

      expect(result).toEqual({
        user: mockUser,
        access_token: 'new_access_token',
      });
      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'secret',
      });
      expect(usersService.findById).toHaveBeenCalledWith(payload.sub);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshToken = 'invalid_refresh_token';

      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const refreshToken = 'valid_refresh_token';
      const payload = { sub: 999, email: 'test@example.com' };

      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(null);
      configService.get.mockReturnValue('secret');

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
    });

    it('should return null for invalid password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    it('should return user by id', async () => {
      const userId = 1;

      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.findUserById(userId);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    it('should return null if user not found', async () => {
      const userId = 999;

      usersService.findById.mockResolvedValue(null);

      const result = await service.findUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe('findUserByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';

      usersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(email);

      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';

      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.findUserByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('generateTokens (private method testing through public methods)', () => {
    it('should generate both access and refresh tokens', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersService.create.mockResolvedValue(mockUserWithoutPassword);
      usersService.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');
      configService.get
        .mockReturnValueOnce('jwt_secret')
        .mockReturnValueOnce('jwt_refresh_secret');

      await service.register(registerDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id },
        { secret: 'jwt_secret', expiresIn: '15m' }
      );
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id },
        { secret: 'jwt_refresh_secret', expiresIn: '7d' }
      );
    });
  });
});
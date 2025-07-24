import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User } from '../auth/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Role } from '../auth/enums/role.enum';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithoutPassword = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      repository.findOne.mockResolvedValue(null); // No existing user
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);
      mockedBcrypt.hash.mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: 'hashedPassword',
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      repository.findOne.mockResolvedValue(mockUser); // Existing user

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users without passwords', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
      };

      const users = [mockUser];
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([users, 1]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        users: [mockUserWithoutPassword],
        total: 1,
        page: 1,
        limit: 10,
      });
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should apply search filter', async () => {
      const queryDto: QueryUserDto = {
        search: 'john',
        page: 1,
        limit: 10,
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: '%john%' }
      );
    });

    it('should apply role filter', async () => {
      const queryDto: QueryUserDto = {
        role: Role.ADMIN,
        page: 1,
        limit: 10,
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(queryDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.role = :role', {
        role: Role.ADMIN,
      });
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUserWithoutPassword);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      repository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return null if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should successfully update user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      repository.findOne.mockResolvedValue(mockUser);
      repository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual({
        ...mockUserWithoutPassword,
        firstName: 'Jane',
        lastName: 'Smith',
      });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = { ...mockUser, id: 2, email: 'existing@example.com' };
      repository.findOne
        .mockResolvedValueOnce(mockUser) // First call for finding user to update
        .mockResolvedValueOnce(existingUser); // Second call for checking email conflict

      await expect(service.update(1, updateUserDto)).rejects.toThrow(ConflictException);
      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.verifyPassword(mockUser, 'password123');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return false for incorrect password', async () => {
      mockedBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.verifyPassword(mockUser, 'wrongpassword');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      repository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      repository.save.mockResolvedValue(mockUser);

      await service.changePassword(1, changePasswordDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', mockUser.password);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.changePassword(999, changePasswordDto)).rejects.toThrow(
        NotFoundException
      );
      await expect(service.changePassword(999, changePasswordDto)).rejects.toThrow(
        'User with ID 999 not found'
      );
    });

    it('should throw BadRequestException for incorrect current password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };

      repository.findOne.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.changePassword(1, changePasswordDto)).rejects.toThrow(
        'Current password is incorrect'
      );
    });
  });

  describe('remove', () => {
    it('should successfully remove user', async () => {
      repository.findOne.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('User with ID 999 not found');
    });
  });
});
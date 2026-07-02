import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../../src/modules/auth/application/services/auth.service';
import { User } from '../../../../src/modules/users/infra/data/typeorm/user.entity';
import { createMockUserRepository } from '../../../mocks/user-repository.mock';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: ReturnType<typeof createMockUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    nickname: 'aivacol',
    password: 'hashed-password',
  } as User;

  beforeEach(async () => {
    userRepository = createMockUserRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('fake-jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('Should return the user when credentials are valid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('aivacol', 'correct-password');

      expect(result).toEqual(mockUser);
    });

    it('Should throw UnauthorizedException when the user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateUser('non-existent-user', 'any-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Should throw UnauthorizedException when the password is incorrect', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('aivacol', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('Should return an accessToken signed with the correct payload', () => {
      const result = service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        nickname: mockUser.nickname,
      });
      expect(result).toEqual({ accessToken: 'fake-jwt-token' });
    });
  });
});

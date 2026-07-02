import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from '../../../../src/modules/auth/application/usecases/login.usecase';
import { AuthService } from '../../../../src/modules/auth/application/services/auth.service';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authService: { validateUser: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    authService = module.get(AuthService);
  });

  it('Should validate the user and return the login token', async () => {
    const mockUser = { id: 'user-1', nickname: 'aivacol' };
    authService.validateUser.mockResolvedValue(mockUser as any);
    authService.login.mockResolvedValue({ accessToken: 'fake-jwt-token' });

    const result = await useCase.execute({
      nickname: 'aivacol',
      password: 'correct-password',
    });

    expect(authService.validateUser).toHaveBeenCalledWith(
      'aivacol',
      'correct-password',
    );
    expect(authService.login).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual({ accessToken: 'fake-jwt-token' });
  });

  it('Should propagate UnauthorizedException when validation fails', async () => {
    authService.validateUser.mockRejectedValue(
      new Error('invalid credentials'),
    );

    await expect(
      useCase.execute({ nickname: 'x', password: 'y' }),
    ).rejects.toThrow('invalid credentials');

    expect(authService.login).not.toHaveBeenCalled();
  });
});

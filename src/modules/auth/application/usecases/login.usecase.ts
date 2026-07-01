import { Injectable } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

interface LoginInput {
  nickname: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(private readonly authService: AuthService) {}

  async execute({ nickname, password }: LoginInput) {
    const user = await this.authService.validateUser(nickname, password);
    return this.authService.login(user);
  }
}

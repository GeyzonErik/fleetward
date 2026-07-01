import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/infra/data/typeorm/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(nickname: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { nickname } });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return user;
  }

  login(user: User) {
    const payload = { sub: user.id, nickname: user.nickname };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}

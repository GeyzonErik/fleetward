import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { LoginDto } from '../dto/login.dto';
import { Public } from 'src/shared/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}

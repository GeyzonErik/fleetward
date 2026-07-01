import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../../../modules/auth/infra/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    nickname: string;
  };
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();

    return {
      sub: request.user.userId,
      nickname: request.user.nickname,
    };
  },
);

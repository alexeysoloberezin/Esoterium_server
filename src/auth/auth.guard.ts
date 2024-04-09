import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.getTokenFromHeaders(request);
    if (!token) throw new UnauthorizedException('Please login to continue');
    const secret = this.config.get('JWT_SECRET');
    try {
      const payload = await this.jwt.verifyAsync(token, { secret });
      console.log('payload', payload);
      request['user'] = payload;
    } catch (error) {
      throw new NotAcceptableException('Session timed out, please login again');
    }
    return true;
  }

  private getTokenFromHeaders(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    return undefined;
  }
}

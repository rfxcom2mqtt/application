import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authToken = this.configService.get<string>('frontend.authToken');

    // If no auth token is configured, allow access
    if (!authToken) {
      return true;
    }

    const authHeader = request.headers.authorization;

    if (!authHeader || authHeader === 'null') {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token || token !== authToken) {
      throw new UnauthorizedException('Invalid authorization token');
    }

    return true;
  }
}

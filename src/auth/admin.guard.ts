import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Предполагается, что user уже прикреплен к запросу в AuthGuard

    // console.log('user.role', user.role, user);
    // if (!user || user.role !== 'admin') {
    //   throw new ForbiddenException('Access Denied');
    // }
    if (!user) {
      console.error('User object is not attached to request');
      throw new ForbiddenException('Access Denied: No user object');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [JwtModule.register({ global: true })],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}

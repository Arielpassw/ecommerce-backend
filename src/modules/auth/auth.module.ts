import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
@Module({
  imports: [
  PassportModule,
  JwtModule.register({
    secret: 'SUPER_SECRET_JWT',
    signOptions: {
      expiresIn: '1d',
    },
  }),
],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
import { randomUUID } from 'node:crypto';
import {
  Inject,
  Injectable,
  type OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from '@node-rs/argon2';
import { type AppConfigService } from '../../config/configuration.js';
import { type UserRow } from '../../database/schema/index.js';
import { UsersService } from '../users/users.service.js';
import {
  type AuthResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto.js';
import { type LoginDto } from './dto/login.dto.js';
import { type RegisterDto } from './dto/register.dto.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly expiresInSeconds: number;
  private timingSafeDummyHash = '';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(ConfigService) config: AppConfigService,
  ) {
    this.expiresInSeconds = config.get('auth', {
      infer: true,
    }).jwtExpiresInSeconds;
  }

  async onModuleInit(): Promise<void> {
    this.timingSafeDummyHash = await hash(randomUUID());
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const passwordHash = await hash(dto.password);
    const user = await this.usersService.create(dto.email, passwordHash);
    return this.issueToken(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = await verify(
      user?.passwordHash ?? this.timingSafeDummyHash,
      dto.password,
    );
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email or password is incorrect', {
        description: 'INVALID_CREDENTIALS',
      });
    }
    return this.issueToken(user);
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Missing or invalid access token', {
        description: 'UNAUTHORIZED',
      });
    }
    return UserResponseDto.fromRow(user);
  }

  private async issueToken(user: UserRow): Promise<AuthResponseDto> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.expiresInSeconds,
      user: UserResponseDto.fromRow(user),
    };
  }
}

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
import { type AppConfigService } from '../../config/config.types.js';
import { ErrorCode } from '../../common/constants/error-codes.constants.js';
import { type UserRow } from '../../database/database.types.js';
import { UsersService } from '../users/users.service.js';
import {
  INVALID_CREDENTIALS_MESSAGE,
  INVALID_TOKEN_MESSAGE,
  TOKEN_TYPE,
} from './auth.constants.js';
import { type AccessTokenPayload } from './auth.types.js';
import { type AuthResponseDto } from './dto/auth-response.dto.js';
import { type LoginDto } from './dto/login.dto.js';
import { type RegisterDto } from './dto/register.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

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
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE, {
        description: ErrorCode.InvalidCredentials,
      });
    }
    return this.issueToken(user);
  }

  async me(userId: string): Promise<UserResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException(INVALID_TOKEN_MESSAGE, {
        description: ErrorCode.Unauthorized,
      });
    }
    return UserResponseDto.fromRow(user);
  }

  private async issueToken(user: UserRow): Promise<AuthResponseDto> {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: TOKEN_TYPE,
      expiresIn: this.expiresInSeconds,
      user: UserResponseDto.fromRow(user),
    };
  }
}

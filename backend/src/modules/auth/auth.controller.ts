import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { type AuthUser } from '../../common/types/request.types.js';
import { AuthService } from './auth.service.js';
import { AuthResponseDto, UserResponseDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Create an account and receive an access token' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  @ApiConflictResponse({ type: ErrorResponseDto, description: 'EMAIL_TAKEN' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange email and password for an access token' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'INVALID_CREDENTIALS',
  })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current user profile' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'UNAUTHORIZED',
  })
  me(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.authService.me(user.id);
  }
}

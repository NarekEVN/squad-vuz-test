import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../../../common/transformers/normalize-email.transformer.js';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../auth.constants.js';

export class RegisterDto {
  @ApiProperty({ example: 'test@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @ApiProperty({
    example: 'test1234',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsString()
  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

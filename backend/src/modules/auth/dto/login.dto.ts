import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { normalizeEmail } from '../../../common/transformers/normalize-email.transformer.js';
import { PASSWORD_MAX_LENGTH } from '../auth.constants.js';

export class LoginDto {
  @ApiProperty({ example: 'test@example.com' })
  @Transform(normalizeEmail)
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'test1234' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}

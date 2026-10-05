import { ApiProperty } from '@nestjs/swagger';
import { type UserRow } from '../../../database/schema/index.js';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;

  static fromRow(row: UserRow): UserResponseDto {
    return {
      id: row.id,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
    };
  }
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty({ example: 3600, description: 'Token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

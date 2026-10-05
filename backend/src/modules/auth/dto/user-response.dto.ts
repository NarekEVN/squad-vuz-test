import { ApiProperty } from '@nestjs/swagger';
import { type UserRow } from '../../../database/database.types.js';

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

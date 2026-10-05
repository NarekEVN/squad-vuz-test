import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'SQUAD_FULL' })
  error: string;

  @ApiProperty({ example: 'A squad cannot have more than 6 characters' })
  message: string;

  @ApiPropertyOptional()
  details?: unknown;
}

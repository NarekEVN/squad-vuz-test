import { ApiProperty } from '@nestjs/swagger';
import { TOKEN_TYPE } from '../auth.constants.js';
import { UserResponseDto } from './user-response.dto.js';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ example: TOKEN_TYPE })
  tokenType: typeof TOKEN_TYPE;

  @ApiProperty({ example: 3600, description: 'Token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

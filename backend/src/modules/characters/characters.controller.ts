import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';
import { Public } from '../../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { type CacheResult } from '../../integrations/redis/cache.service.js';
import { CharactersService } from './characters.service.js';
import {
  CharacterDto,
  CharacterFiltersResponseDto,
  CharacterListResponseDto,
} from './dto/character.dto.js';
import { ListCharactersQueryDto } from './dto/list-characters-query.dto.js';

const CACHE_HEADER = 'X-Cache';

class ParseCharacterIdPipe extends ParseIntPipe {
  constructor() {
    super({
      exceptionFactory: () =>
        new BadRequestException('Character id must be an integer', {
          description: 'INVALID_ID',
        }),
    });
  }
}

function send<T>(res: Response, result: CacheResult<T>): T {
  res.setHeader(CACHE_HEADER, result.status);
  return result.value;
}

@Public()
@ApiTags('characters')
@ApiHeader({
  name: CACHE_HEADER,
  description: 'HIT, MISS or BYPASS (Redis unavailable)',
  required: false,
})
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiOperation({ summary: 'Search, filter and page through characters' })
  @ApiOkResponse({ type: CharacterListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED or INVALID_CURSOR',
  })
  async list(
    @Query() query: ListCharactersQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CharacterListResponseDto> {
    return send(res, await this.charactersService.list(query));
  }

  @Get('filters')
  @ApiOperation({ summary: 'Available filter values with character counts' })
  @ApiOkResponse({ type: CharacterFiltersResponseDto })
  async filters(
    @Res({ passthrough: true }) res: Response,
  ): Promise<CharacterFiltersResponseDto> {
    return send(res, await this.charactersService.filters());
  }

  @Get(':id')
  @ApiOperation({ summary: 'A single character with full details' })
  @ApiOkResponse({ type: CharacterDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'INVALID_ID' })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'CHARACTER_NOT_FOUND',
  })
  async findOne(
    @Param('id', ParseCharacterIdPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<CharacterDto> {
    return send(res, await this.charactersService.findOne(id));
  }
}

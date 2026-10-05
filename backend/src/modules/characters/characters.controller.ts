import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { type Response } from 'express';
import { CACHE_STATUS_HEADER } from '../../common/constants/http.constants.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { withCacheHeader } from '../../common/utils/cache-header.util.js';
import { CharactersService } from './characters.service.js';
import { CharacterFiltersResponseDto } from './dto/character-filters-response.dto.js';
import { CharacterListResponseDto } from './dto/character-list-response.dto.js';
import { CharacterDto } from './dto/character.dto.js';
import { ListCharactersQueryDto } from './dto/list-characters-query.dto.js';
import { ParseCharacterIdPipe } from './pipes/parse-character-id.pipe.js';

@Public()
@ApiTags('characters')
@ApiHeader({
  name: CACHE_STATUS_HEADER,
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
    return withCacheHeader(res, await this.charactersService.list(query));
  }

  @Get('filters')
  @ApiOperation({ summary: 'Available filter values with character counts' })
  @ApiOkResponse({ type: CharacterFiltersResponseDto })
  async filters(
    @Res({ passthrough: true }) res: Response,
  ): Promise<CharacterFiltersResponseDto> {
    return withCacheHeader(res, await this.charactersService.filters());
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
    return withCacheHeader(res, await this.charactersService.findOne(id));
  }
}

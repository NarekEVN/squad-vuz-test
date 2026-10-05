import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { type AuthUser } from '../../common/types/request.types.js';
import { ParseCharacterIdPipe } from '../characters/pipes/parse-character-id.pipe.js';
import { CreateSquadDto } from './dto/create-squad.dto.js';
import { SquadSummaryDto } from './dto/squad-summary.dto.js';
import { SquadDto } from './dto/squad.dto.js';
import { UpdateSquadDto } from './dto/update-squad.dto.js';
import { ParseSquadIdPipe } from './pipes/parse-squad-id.pipe.js';
import { SquadsService } from './squads.service.js';

@ApiTags('squads')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'UNAUTHORIZED',
})
@Controller('squads')
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Get()
  @ApiOperation({ summary: "The current user's squads" })
  @ApiOkResponse({ type: [SquadSummaryDto] })
  list(@CurrentUser() user: AuthUser): Promise<SquadSummaryDto[]> {
    return this.squadsService.list(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a squad, optionally with members' })
  @ApiCreatedResponse({ type: SquadDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NAME_TAKEN or CHARACTER_ALREADY_IN_SQUAD',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_FULL, UNKNOWN_CHARACTERS or SQUAD_LIMIT_REACHED',
  })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateSquadDto,
  ): Promise<SquadDto> {
    return this.squadsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'A squad with its characters and statistics' })
  @ApiOkResponse({ type: SquadDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NOT_FOUND',
  })
  findOne(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) id: string,
  ): Promise<SquadDto> {
    return this.squadsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Rename a squad and/or replace all its members' })
  @ApiOkResponse({ type: SquadDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NOT_FOUND',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NAME_TAKEN or CHARACTER_ALREADY_IN_SQUAD',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_FULL or UNKNOWN_CHARACTERS',
  })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) id: string,
    @Body() dto: UpdateSquadDto,
  ): Promise<SquadDto> {
    return this.squadsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a squad' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NOT_FOUND',
  })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) id: string,
  ): Promise<void> {
    return this.squadsService.remove(user.id, id);
  }

  @Post(':id/characters/:characterId')
  @ApiOperation({ summary: 'Add a character to the first free slot' })
  @ApiCreatedResponse({ type: SquadDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NOT_FOUND or CHARACTER_NOT_FOUND',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'CHARACTER_ALREADY_IN_SQUAD',
  })
  @ApiUnprocessableEntityResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_FULL',
  })
  addMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) id: string,
    @Param('characterId', ParseCharacterIdPipe) characterId: number,
  ): Promise<SquadDto> {
    return this.squadsService.addMember(user.id, id, characterId);
  }

  @Delete(':id/characters/:characterId')
  @ApiOperation({ summary: 'Remove a character from a squad' })
  @ApiOkResponse({ type: SquadDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'SQUAD_NOT_FOUND or CHARACTER_NOT_IN_SQUAD',
  })
  removeMember(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) id: string,
    @Param('characterId', ParseCharacterIdPipe) characterId: number,
  ): Promise<SquadDto> {
    return this.squadsService.removeMember(user.id, id, characterId);
  }
}

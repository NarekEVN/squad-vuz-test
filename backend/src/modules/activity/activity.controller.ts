import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { ErrorResponseDto } from '../../common/dto/error-response.dto.js';
import { type AuthUser } from '../../common/types/request.types.js';
import { ParseSquadIdPipe } from '../squads/pipes/parse-squad-id.pipe.js';
import { ActivityService } from './activity.service.js';
import { PickStatsQueryDto } from './dto/pick-stats-query.dto.js';
import { PickStatsResponseDto } from './dto/pick-stats-response.dto.js';
import { SquadHistoryQueryDto } from './dto/squad-history-query.dto.js';
import { SquadHistoryResponseDto } from './dto/squad-history-response.dto.js';

@ApiTags('activity')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'UNAUTHORIZED',
})
@Controller()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('squads/:id/history')
  @ApiOperation({
    summary: "Timeline of a squad's events, newest first (MongoDB)",
    description:
      'Includes events of squads that were later deleted. Returns an empty list for squads owned by someone else.',
  })
  @ApiOkResponse({ type: SquadHistoryResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'INVALID_ID, INVALID_CURSOR or VALIDATION_FAILED',
  })
  history(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseSquadIdPipe) squadId: string,
    @Query() query: SquadHistoryQueryDto,
  ): Promise<SquadHistoryResponseDto> {
    return this.activityService.squadHistory(user.id, squadId, query);
  }

  @Get('activity/stats/picks')
  @ApiOperation({
    summary:
      'Character pick statistics across all users (aggregation pipeline)',
  })
  @ApiOkResponse({ type: PickStatsResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'VALIDATION_FAILED',
  })
  pickStats(@Query() query: PickStatsQueryDto): Promise<PickStatsResponseDto> {
    return this.activityService.pickStats(query.days);
  }
}

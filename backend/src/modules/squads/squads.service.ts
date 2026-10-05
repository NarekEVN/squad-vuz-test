import { Injectable } from '@nestjs/common';
import {
  type SquadRow,
  type Transaction,
} from '../../database/database.types.js';
import { characterNotFound } from '../characters/characters.errors.js';
import { CharactersService } from '../characters/characters.service.js';
import {
  squadLimitReached,
  squadNameTaken,
  squadNotFound,
  characterNotInSquad,
  unknownCharacters,
} from './domain/squad.errors.js';
import {
  assertCanAddMember,
  assertValidMemberList,
  firstFreePosition,
  slotsInOrder,
} from './domain/squad.rules.js';
import { type CreateSquadDto } from './dto/create-squad.dto.js';
import { type SquadSummaryDto } from './dto/squad-summary.dto.js';
import { type SquadDto } from './dto/squad.dto.js';
import { type UpdateSquadDto } from './dto/update-squad.dto.js';
import { MAX_SQUADS_PER_USER } from './squads.constants.js';
import { toSquadDto, toSquadSummaryDto } from './squads.mapper.js';
import { SquadsRepository } from './squads.repository.js';
import { type SquadState } from './squads.types.js';

@Injectable()
export class SquadsService {
  constructor(
    private readonly squadsRepository: SquadsRepository,
    private readonly charactersService: CharactersService,
  ) {}

  async list(userId: string): Promise<SquadSummaryDto[]> {
    const rows = await this.squadsRepository.findSummaries(userId);
    return rows.map(toSquadSummaryDto);
  }

  async findOne(userId: string, squadId: string): Promise<SquadDto> {
    const squad = await this.squadsRepository.findOwned(userId, squadId);
    if (!squad) {
      throw squadNotFound();
    }
    const members = await this.squadsRepository.findMembers(squadId);
    return this.toDto({ squad, members });
  }

  async create(userId: string, dto: CreateSquadDto): Promise<SquadDto> {
    const characterIds = dto.characterIds ?? [];
    assertValidMemberList(characterIds);

    const state = await this.squadsRepository.transaction(async (tx) => {
      await this.squadsRepository.lockUser(tx, userId);
      const owned = await this.squadsRepository.countForUser(tx, userId);
      if (owned >= MAX_SQUADS_PER_USER) {
        throw squadLimitReached();
      }
      if (await this.squadsRepository.isNameTaken(tx, userId, dto.name)) {
        throw squadNameTaken();
      }
      await this.assertCharactersExist(tx, characterIds);

      const squad = await this.squadsRepository.insert(tx, userId, dto.name);
      const members = slotsInOrder(characterIds);
      await this.squadsRepository.insertMembers(tx, squad.id, members);
      return { squad, members };
    });
    return this.toDto(state);
  }

  async update(
    userId: string,
    squadId: string,
    dto: UpdateSquadDto,
  ): Promise<SquadDto> {
    const { name, characterIds } = dto;
    if (characterIds) {
      assertValidMemberList(characterIds);
    }

    const state = await this.squadsRepository.transaction(async (tx) => {
      if (name !== undefined) {
        await this.squadsRepository.lockUser(tx, userId);
      }
      await this.lockOwnedSquad(tx, userId, squadId);
      if (
        name !== undefined &&
        (await this.squadsRepository.isNameTaken(tx, userId, name, squadId))
      ) {
        throw squadNameTaken();
      }
      if (characterIds) {
        await this.assertCharactersExist(tx, characterIds);
        await this.squadsRepository.deleteAllMembers(tx, squadId);
        await this.squadsRepository.insertMembers(
          tx,
          squadId,
          slotsInOrder(characterIds),
        );
      }
      const squad = await this.squadsRepository.update(
        tx,
        squadId,
        name === undefined ? {} : { name },
      );
      const members = await this.squadsRepository.findMembers(squadId, tx);
      return { squad, members };
    });
    return this.toDto(state);
  }

  async remove(userId: string, squadId: string): Promise<void> {
    if (!(await this.squadsRepository.delete(userId, squadId))) {
      throw squadNotFound();
    }
  }

  async addMember(
    userId: string,
    squadId: string,
    characterId: number,
  ): Promise<SquadDto> {
    const state = await this.squadsRepository.transaction(async (tx) => {
      await this.lockOwnedSquad(tx, userId, squadId);
      const existing = await this.squadsRepository.existingCharacterIds(tx, [
        characterId,
      ]);
      if (!existing.has(characterId)) {
        throw characterNotFound(characterId);
      }

      const members = await this.squadsRepository.findMembers(squadId, tx);
      assertCanAddMember(
        members.map((member) => member.characterId),
        characterId,
      );
      const slot = {
        characterId,
        position: firstFreePosition(members.map((member) => member.position)),
      };
      await this.squadsRepository.insertMembers(tx, squadId, [slot]);
      const squad = await this.squadsRepository.update(tx, squadId, {});
      return { squad, members: [...members, slot] };
    });
    return this.toDto(state);
  }

  async removeMember(
    userId: string,
    squadId: string,
    characterId: number,
  ): Promise<SquadDto> {
    const state = await this.squadsRepository.transaction(async (tx) => {
      await this.lockOwnedSquad(tx, userId, squadId);
      if (
        !(await this.squadsRepository.deleteMember(tx, squadId, characterId))
      ) {
        throw characterNotInSquad(characterId);
      }
      const squad = await this.squadsRepository.update(tx, squadId, {});
      const members = await this.squadsRepository.findMembers(squadId, tx);
      return { squad, members };
    });
    return this.toDto(state);
  }

  private async lockOwnedSquad(
    tx: Transaction,
    userId: string,
    squadId: string,
  ): Promise<SquadRow> {
    const squad = await this.squadsRepository.lockSquad(tx, userId, squadId);
    if (!squad) {
      throw squadNotFound();
    }
    return squad;
  }

  private async assertCharactersExist(
    tx: Transaction,
    characterIds: number[],
  ): Promise<void> {
    const existing = await this.squadsRepository.existingCharacterIds(
      tx,
      characterIds,
    );
    const missing = characterIds.filter((id) => !existing.has(id));
    if (missing.length > 0) {
      throw unknownCharacters(missing);
    }
  }

  private async toDto({ squad, members }: SquadState): Promise<SquadDto> {
    const characters = await this.charactersService.findManyByIds(
      members.map((member) => member.characterId),
    );
    return toSquadDto(squad, members, characters);
  }
}

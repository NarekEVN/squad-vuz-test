import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { type Collection, type Db, type Filter, ObjectId } from 'mongodb';
import { MONGO_DB } from '../../integrations/mongo/mongo.constants.js';
import { SquadChange } from '../squads/squads.constants.js';
import { ACTIVITY_COLLECTION } from './activity.constants.js';
import {
  type ActivityEventDocument,
  type HistoryCursor,
  type HistoryPage,
  type PickStatsAggregate,
} from './activity.types.js';

const countWhen = (reason: string) => ({
  $sum: { $cond: [{ $eq: ['$type', reason] }, 1, 0] },
});

@Injectable()
export class ActivityRepository implements OnModuleInit {
  private readonly logger = new Logger(ActivityRepository.name);
  private readonly events: Collection<ActivityEventDocument>;

  constructor(@Inject(MONGO_DB) db: Db) {
    this.events = db.collection<ActivityEventDocument>(ACTIVITY_COLLECTION);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.events.createIndexes([
        { key: { squadId: 1, userId: 1, occurredAt: -1, _id: -1 } },
        { key: { type: 1, occurredAt: 1 } },
        { key: { userId: 1, occurredAt: -1 } },
      ]);
    } catch (error) {
      this.logger.warn(`Could not create activity indexes: ${String(error)}`);
    }
  }

  async insert(event: ActivityEventDocument): Promise<void> {
    await this.events.insertOne(event);
  }

  async findSquadHistory(
    userId: string,
    squadId: string,
    limit: number,
    before?: HistoryCursor,
  ): Promise<HistoryPage> {
    const filter: Filter<ActivityEventDocument> = { userId, squadId };
    if (before) {
      const occurredAt = new Date(before.occurredAt);
      filter.$or = [
        { occurredAt: { $lt: occurredAt } },
        { occurredAt, _id: { $lt: new ObjectId(before.id) } },
      ];
    }
    const events = await this.events
      .find(filter)
      .sort({ occurredAt: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();
    return { events: events.slice(0, limit), hasMore: events.length > limit };
  }

  async pickStats(since: Date, top: number): Promise<PickStatsAggregate> {
    const [result] = await this.events
      .aggregate<PickStatsAggregate>([
        {
          $match: {
            occurredAt: { $gte: since },
            type: { $in: [SquadChange.MemberAdded, SquadChange.MemberRemoved] },
            character: { $exists: true },
          },
        },
        { $sort: { occurredAt: 1 } },
        {
          $facet: {
            characters: [
              {
                $group: {
                  _id: '$character.id',
                  name: { $last: '$character.name' },
                  thumbnail: { $last: '$character.thumbnail' },
                  added: countWhen(SquadChange.MemberAdded),
                  removed: countWhen(SquadChange.MemberRemoved),
                  lastPickedAt: {
                    $max: {
                      $cond: [
                        { $eq: ['$type', SquadChange.MemberAdded] },
                        '$occurredAt',
                        null,
                      ],
                    },
                  },
                },
              },
              { $addFields: { net: { $subtract: ['$added', '$removed'] } } },
              { $sort: { added: -1, net: -1, _id: 1 } },
              { $limit: top },
              {
                $project: {
                  _id: 0,
                  characterId: '$_id',
                  name: 1,
                  thumbnail: 1,
                  added: 1,
                  removed: 1,
                  net: 1,
                  lastPickedAt: 1,
                },
              },
            ],
            daily: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$occurredAt' },
                  },
                  added: countWhen(SquadChange.MemberAdded),
                  removed: countWhen(SquadChange.MemberRemoved),
                },
              },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, date: '$_id', added: 1, removed: 1 } },
            ],
            totals: [
              {
                $group: {
                  _id: null,
                  added: countWhen(SquadChange.MemberAdded),
                  removed: countWhen(SquadChange.MemberRemoved),
                },
              },
              { $project: { _id: 0 } },
            ],
          },
        },
      ])
      .toArray();
    return result ?? { characters: [], daily: [], totals: [] };
  }
}

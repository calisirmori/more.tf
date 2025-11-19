/**
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

// ============= Primitives =============

export const TF2ClassSchema = z.enum([
  'scout',
  'soldier',
  'pyro',
  'demoman',
  'heavyweapons',
  'engineer',
  'medic',
  'sniper',
  'spy',
  'undefined',
]);

export const TeamSchema = z.enum(['red', 'blue', 'spectator', 'unknown']);

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const SteamIDSchema = z.object({
  id3: z.string().regex(/\[U:1:\d+\]/),
  id64: z.string().regex(/\d{17}/),
});

export const PlayerIdentifierSchema = z.object({
  name: z.string(),
  steamId: SteamIDSchema,
  team: TeamSchema,
  userId: z.string(),
});

// ============= Player Stats Schemas =============

export const WeaponStatsSchema = z.object({
  kills: z.number().int().nonnegative(),
  damage: z.number().nonnegative(),
  shotsFired: z.number().int().nonnegative(),
  shotsHit: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1),
});

export const ClassStatsSchema = z.object({
  kills: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  deaths: z.number().int().nonnegative(),
  damage: z.number().nonnegative(),
  damageTaken: z.number().nonnegative(),
  heals: z.number().nonnegative(),
  weapons: z.record(z.string(), WeaponStatsSchema),
  playtime: z.number().nonnegative(),
});

export const MedicStatsSchema = z.object({
  ubers: z.number().int().nonnegative(),
  drops: z.number().int().nonnegative(),
  uberLength: z.number().nonnegative(),
  nearFullDeaths: z.number().int().nonnegative(),
  healAfterSpawn: z.number().nonnegative(),
  uberTypes: z.record(z.string(), z.number().int().nonnegative()),
  averageUberLength: z.number().nonnegative(),
});

export const ResupplyStatsSchema = z.object({
  medkit: z.number().int().nonnegative(),
  medkitsHealingDone: z.number().nonnegative(),
  ammo: z.number().int().nonnegative(),
});

export const DamageDivisionSchema = z.object({
  damageTo: z.record(z.string(), z.number().nonnegative()),
  damageFrom: z.record(z.string(), z.number().nonnegative()),
});

export const PlayerStatsSchema = z.object({
  steamId: SteamIDSchema,
  userName: z.string(),
  team: TeamSchema,
  primaryClass: TF2ClassSchema,
  joinedGame: z.number(),
  leftGame: z.number().nullable(),
  playtime: z.number().nonnegative(),
  kills: z.number().int().nonnegative(),
  deaths: z.number().int().nonnegative(),
  assists: z.number().int().nonnegative(),
  suicides: z.number().int().nonnegative(),
  damage: z.number().nonnegative(),
  damageReal: z.number().nonnegative(),
  damageTaken: z.number().nonnegative(),
  damageTakenReal: z.number().nonnegative(),
  damagePerMinute: z.number().nonnegative(),
  damageTakenPerMinute: z.number().nonnegative(),
  killsPerDeath: z.number().nonnegative(),
  killAssistsPerDeath: z.number().nonnegative(),
  heals: z.number().nonnegative(),
  healsPerMinute: z.number().nonnegative(),
  crossbowHealing: z.number().nonnegative(),
  medicStats: MedicStatsSchema,
  medicPicks: z.number().int().nonnegative(),
  medicDrops: z.number().int().nonnegative(),
  headshots: z.number().int().nonnegative(),
  headshotKills: z.number().int().nonnegative(),
  backstabs: z.number().int().nonnegative(),
  airshots: z.number().int().nonnegative(),
  pointCaps: z.number().int().nonnegative(),
  capturesBlocked: z.number().int().nonnegative(),
  extinguished: z.number().int().nonnegative(),
  dominated: z.number().int().nonnegative(),
  revenged: z.number().int().nonnegative(),
  buildingKills: z.number().int().nonnegative(),
  buildings: z.number().int().nonnegative(),
  uberHits: z.number().int().nonnegative(),
  deathScreenTime: z.number().nonnegative(),
  classStats: z.record(z.string(), ClassStatsSchema),
  damageDivision: DamageDivisionSchema,
  resupply: ResupplyStatsSchema,
  combatScore: z.number().nonnegative(),
  roundPerformance: z.record(
    z.string(),
    z.object({
      kills: z.number().int().nonnegative(),
      deaths: z.number().int().nonnegative(),
      damage: z.number().nonnegative(),
      heals: z.number().nonnegative(),
    })
  ),
});

// ============= Match/Round Schemas =============

export const TeamStatsSchema = z.object({
  score: z.number().int().nonnegative(),
  kills: z.number().int().nonnegative(),
  damage: z.number().nonnegative(),
  heals: z.number().nonnegative(),
  charges: z.number().int().nonnegative(),
  drops: z.number().int().nonnegative(),
  firstcaps: z.number().int().nonnegative(),
  caps: z.number().int().nonnegative(),
});

export const RoundTeamStatsSchema = z.object({
  score: z.number().int().nonnegative(),
  kills: z.number().int().nonnegative(),
  damage: z.number().nonnegative(),
  ubers: z.number().int().nonnegative(),
});

export const CaptureEventSchema = z.object({
  team: TeamSchema,
  time: z.number().nonnegative(),
  name: z.string(),
});

export const RoundSchema = z.object({
  roundNumber: z.number().int().positive(),
  roundBegin: z.number(),
  roundEnd: z.number(),
  roundDuration: z.number().nonnegative(),
  winner: TeamSchema,
  firstCap: TeamSchema.nullable(),
  overtime: z.boolean(),
  teamScores: z.object({
    red: RoundTeamStatsSchema,
    blue: RoundTeamStatsSchema,
  }),
  captureEvents: z.array(CaptureEventSchema),
  events: z.array(z.any()), // GameEvent (too complex to fully validate)
  playerPerformance: z.record(
    z.string(),
    z.object({
      kills: z.number().int().nonnegative(),
      deaths: z.number().int().nonnegative(),
      damage: z.number().nonnegative(),
      heals: z.number().nonnegative(),
    })
  ),
});

export const MatchInfoSchema = z.object({
  logId: z.number().int().positive(),
  map: z.string(),
  title: z.string(),
  date: z.number(),
  matchLength: z.number().nonnegative(),
  winner: TeamSchema,
  status: z.enum(['completed', 'incomplete', 'error']),
  pauseData: z.object({
    lastPause: z.number(),
    pauseSum: z.number(),
  }),
});

export const ParsedMatchSchema = z.object({
  info: MatchInfoSchema,
  teams: z.object({
    red: TeamStatsSchema,
    blue: TeamStatsSchema,
  }),
  players: z.record(z.string(), PlayerStatsSchema),
  rounds: z.array(RoundSchema),
  events: z.array(z.any()),
  chat: z.array(
    z.object({
      steamId64: z.string(),
      timestamp: z.number(),
      message: z.string(),
    })
  ),
  healSpread: z.record(z.string(), z.record(z.string(), z.number())),
  killSpread: z.record(z.string(), z.record(z.string(), z.number())),
  assistSpread: z.record(z.string(), z.record(z.string(), z.number())),
  damagePerInterval: z.object({
    red: z.array(z.number()),
    blue: z.array(z.number()),
  }),
  healsPerInterval: z.object({
    red: z.array(z.number()),
    blue: z.array(z.number()),
  }),
  killStreaks: z.record(
    z.string(),
    z.array(
      z.object({
        player: z.string(),
        streak: z.number().int().positive(),
        timestamp: z.number(),
      })
    )
  ),
  parserMetadata: z.object({
    version: z.string(),
    parseTime: z.number().nonnegative(),
    linesProcessed: z.number().int().nonnegative(),
    errors: z.array(
      z.object({
        level: z.enum(['fatal', 'error', 'warning', 'info']),
        message: z.string(),
        lineNumber: z.number().int().optional(),
        rawLine: z.string().optional(),
        context: z.record(z.string(), z.unknown()).optional(),
      })
    ),
    warnings: z.array(
      z.object({
        message: z.string(),
        lineNumber: z.number().int().optional(),
        rawLine: z.string().optional(),
      })
    ),
  }),
});

export const ParseResultSchema = z.object({
  success: z.boolean(),
  data: ParsedMatchSchema.optional(),
  errors: z.array(
    z.object({
      level: z.enum(['fatal', 'error', 'warning', 'info']),
      message: z.string(),
      lineNumber: z.number().int().optional(),
      rawLine: z.string().optional(),
      context: z.record(z.string(), z.unknown()).optional(),
    })
  ),
  warnings: z.array(
    z.object({
      message: z.string(),
      lineNumber: z.number().int().optional(),
      rawLine: z.string().optional(),
    })
  ),
  metadata: z.object({
    parseTime: z.number().nonnegative(),
    linesProcessed: z.number().int().nonnegative(),
    version: z.string(),
    source: z.enum(['cache', 'database', 'logs.tf']),
  }),
});

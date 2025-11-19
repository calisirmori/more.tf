/**
 * Event type definitions for TF2 log parser
 */

export type TF2Class =
  | 'scout'
  | 'soldier'
  | 'pyro'
  | 'demoman'
  | 'heavyweapons'
  | 'engineer'
  | 'medic'
  | 'sniper'
  | 'spy'
  | 'undefined';

export type Team = 'red' | 'blue' | 'spectator' | 'unknown';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface SteamID {
  id3: string; // [U:1:123456789]
  id64: string; // 76561198083801517
}

export interface PlayerIdentifier {
  name: string;
  steamId: SteamID;
  team: Team;
  userId: string; // In-game user ID <75>
}

// ============= Base Event Types =============

export interface BaseEvent {
  type: string;
  timestamp: number; // Unix timestamp
  rawLine: string; // Original log line for debugging
  lineNumber: number;
}

// ============= World Events =============

export interface RoundStartEvent extends BaseEvent {
  type: 'round_start';
}

export interface RoundWinEvent extends BaseEvent {
  type: 'round_win';
  winner: Team;
}

export interface RoundLengthEvent extends BaseEvent {
  type: 'round_length';
  seconds: number;
}

export interface GameOverEvent extends BaseEvent {
  type: 'game_over';
  reason: string;
}

export interface TeamScoreEvent extends BaseEvent {
  type: 'team_score';
  team: Team;
  score: number;
  playerCount: number;
  isFinal: boolean;
}

export interface RoundOvertimeEvent extends BaseEvent {
  type: 'round_overtime';
}

// ============= Player Events =============

export interface PlayerConnectedEvent extends BaseEvent {
  type: 'player_connected';
  player: PlayerIdentifier;
}

export interface PlayerDisconnectedEvent extends BaseEvent {
  type: 'player_disconnected';
  player: PlayerIdentifier;
}

export interface PlayerRoleChangeEvent extends BaseEvent {
  type: 'player_role_change';
  player: PlayerIdentifier;
  class: TF2Class;
}

export interface PlayerTeamChangeEvent extends BaseEvent {
  type: 'player_team_change';
  player: PlayerIdentifier;
  newTeam: Team;
}

export interface PlayerSpawnEvent extends BaseEvent {
  type: 'player_spawn';
  player: PlayerIdentifier;
  class: TF2Class;
}

// ============= Combat Events =============

export interface DamageEvent extends BaseEvent {
  type: 'damage';
  attacker: PlayerIdentifier;
  victim: PlayerIdentifier;
  damage: number;
  realDamage?: number;
  weapon: string;
  crit?: boolean;
  headshot?: boolean;
  airshot?: boolean;
}

export interface KillEvent extends BaseEvent {
  type: 'kill';
  killer: PlayerIdentifier;
  victim: PlayerIdentifier;
  weapon: string;
  customKill?: string;
  attackerPosition: Position;
  victimPosition: Position;
  distance?: number;
}

export interface AssistEvent extends BaseEvent {
  type: 'assist';
  assister: PlayerIdentifier;
  victim: PlayerIdentifier;
  attackerPosition: Position;
  assisterPosition: Position;
  victimPosition: Position;
}

export interface SuicideEvent extends BaseEvent {
  type: 'suicide';
  player: PlayerIdentifier;
  weapon: string;
}

// ============= Weapon Events =============

export interface ShotFiredEvent extends BaseEvent {
  type: 'shot_fired';
  player: PlayerIdentifier;
  weapon: string;
}

export interface ShotHitEvent extends BaseEvent {
  type: 'shot_hit';
  player: PlayerIdentifier;
  weapon: string;
}

// ============= Medic Events =============

export interface HealEvent extends BaseEvent {
  type: 'heal';
  healer: PlayerIdentifier;
  target: PlayerIdentifier;
  healing: number;
  crossbow?: boolean;
  airshot?: boolean;
}

export interface ChargeDeployedEvent extends BaseEvent {
  type: 'charge_deployed';
  medic: PlayerIdentifier;
  medigun: string;
}

export interface ChargeEndedEvent extends BaseEvent {
  type: 'charge_ended';
  medic: PlayerIdentifier;
  duration: number;
}

export interface ChargeReadyEvent extends BaseEvent {
  type: 'charge_ready';
  medic: PlayerIdentifier;
}

export interface MedicDeathEvent extends BaseEvent {
  type: 'medic_death';
  killer: PlayerIdentifier;
  medic: PlayerIdentifier;
  uberCharge: boolean;
  uberPct?: number;
}

export interface FirstHealAfterSpawnEvent extends BaseEvent {
  type: 'first_heal_after_spawn';
  medic: PlayerIdentifier;
  time: number;
}

// ============= Objective Events =============

export interface PointCapturedEvent extends BaseEvent {
  type: 'point_captured';
  team: Team;
  cpName: string;
  cpNumber: string;
  cappers: Array<{
    player: PlayerIdentifier;
    position: Position;
  }>;
}

export interface CaptureBlockedEvent extends BaseEvent {
  type: 'capture_blocked';
  player: PlayerIdentifier;
}

// ============= Building Events =============

export interface BuildingBuiltEvent extends BaseEvent {
  type: 'building_built';
  player: PlayerIdentifier;
  building: string;
}

export interface BuildingKilledEvent extends BaseEvent {
  type: 'building_killed';
  attacker: PlayerIdentifier;
  building: string;
  owner: PlayerIdentifier;
  weapon: string;
  attackerPosition: Position;
}

// ============= Misc Events =============

export interface DominationEvent extends BaseEvent {
  type: 'domination';
  dominator: PlayerIdentifier;
  dominated: PlayerIdentifier;
}

export interface RevengeEvent extends BaseEvent {
  type: 'revenge';
  avenger: PlayerIdentifier;
  victim: PlayerIdentifier;
}

export interface ExtinguishEvent extends BaseEvent {
  type: 'extinguish';
  extinguisher: PlayerIdentifier;
  target: PlayerIdentifier;
}

export interface ItemPickupEvent extends BaseEvent {
  type: 'item_pickup';
  player: PlayerIdentifier;
  item: string;
  healing?: number;
}

export interface ChatMessageEvent extends BaseEvent {
  type: 'chat';
  player: PlayerIdentifier;
  message: string;
}

export interface PauseEvent extends BaseEvent {
  type: 'pause' | 'unpause';
}

// ============= Union Type =============

export type GameEvent =
  | RoundStartEvent
  | RoundWinEvent
  | RoundLengthEvent
  | GameOverEvent
  | TeamScoreEvent
  | RoundOvertimeEvent
  | PlayerConnectedEvent
  | PlayerDisconnectedEvent
  | PlayerRoleChangeEvent
  | PlayerTeamChangeEvent
  | PlayerSpawnEvent
  | DamageEvent
  | KillEvent
  | AssistEvent
  | SuicideEvent
  | ShotFiredEvent
  | ShotHitEvent
  | HealEvent
  | ChargeDeployedEvent
  | ChargeEndedEvent
  | ChargeReadyEvent
  | MedicDeathEvent
  | FirstHealAfterSpawnEvent
  | PointCapturedEvent
  | CaptureBlockedEvent
  | BuildingBuiltEvent
  | BuildingKilledEvent
  | DominationEvent
  | RevengeEvent
  | ExtinguishEvent
  | ItemPickupEvent
  | ChatMessageEvent
  | PauseEvent;

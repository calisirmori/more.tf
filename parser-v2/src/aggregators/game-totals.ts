/**
 * Game Totals Aggregator with Per-Class and Per-Weapon Stats Tracking
 */

import {
  GameEvent,
  TF2Class,
  Team,
  KillEvent,
  DamageEvent,
  HealEvent,
  ChargeDeployedEvent,
  MedicDeathEvent,
  PlayerSpawnEvent,
  PlayerConnectedEvent,
  PlayerDisconnectedEvent,
  PlayerRoleChangeEvent,
  PointCapturedEvent,
  CaptureBlockedEvent,
  BuildingBuiltEvent,
  BuildingKilledEvent,
  ItemPickupEvent,
  ShotFiredEvent,
  ShotHitEvent,
  SuicideEvent,
} from '../types/events';
import {
  GameTotals,
  PlayerGameTotals,
  TeamGameTotals,
  ClassStats,
  WeaponStats,
  PlayerSession,
} from '../types/output';
import { Round } from '../types/match';
import { determineWinner, filterValidRounds } from '../utils/winner-determination';

/**
 * Internal weapon stats tracking
 */
interface InternalWeaponStats {
  kills: number;
  damage: number;
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  backstabs: number;
  airshots: number;
}

/**
 * Internal class stats tracking
 */
interface InternalClassStats {
  // Per-weapon tracking
  weaponStatsMap: Map<string, InternalWeaponStats>;

  // Class totals
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  damageTaken: number;
  healing: number;
  ubers: number;
  drops: number;
  airshots: number;
  headshots: number;
  backstabs: number;
  shotsFired: number;
  shotsHit: number;
  medkits: number;
  medkitsHealth: number;
  capturePointsCapped: number;
  capturesBlocked: number;
  buildingsBuilt: number;
  buildingsDestroyed: number;
}

/**
 * Internal player state
 */
interface PlayerState {
  steamId: string;
  name: string;
  team: Team;
  primaryClass: TF2Class;

  // Per-class stats tracking
  classStatsMap: Map<TF2Class, InternalClassStats>;
  classPlaytimeMap: Map<TF2Class, number>;
  classesPlayedSet: Set<TF2Class>;

  // Current state
  currentClass?: TF2Class;
  currentClassStartTime?: number;
  currentlyConnected: boolean;
  currentSessionStart?: number;
  firstConnected?: number;
  lastDisconnected?: number;
  sessions: PlayerSession[];
}

export class GameTotalsAggregator {
  private playerStats: Map<string, PlayerState> = new Map();
  private teamStats: Map<Team, TeamGameTotals> = new Map();
  private roundWins: { red: number; blue: number } = { red: 0, blue: 0 };
  private roundScores: Array<{ red: number; blue: number }> = [];
  private currentRoundScore: { red: number; blue: number } = { red: 0, blue: 0 };
  private pendingRoundScoreSave: boolean = false;
  private matchStartTime: number = 0;
  private matchEndTime: number = 0;
  private winner?: Team;
  private gameIsActive: boolean = false;

  constructor(
    private logId: number,
    private map: string,
    private title: string
  ) {
    // Initialize team stats
    this.teamStats.set('red', {
      team: 'red',
      score: 0,
      kills: 0,
      deaths: 0,
      damage: 0,
      healing: 0,
      ubers: 0,
      drops: 0,
      capturePoints: 0,
    });

    this.teamStats.set('blue', {
      team: 'blue',
      score: 0,
      kills: 0,
      deaths: 0,
      damage: 0,
      healing: 0,
      ubers: 0,
      drops: 0,
      capturePoints: 0,
    });
  }

  /**
   * Create empty weapon stats
   */
  private createEmptyWeaponStats(): InternalWeaponStats {
    return {
      kills: 0,
      damage: 0,
      shotsFired: 0,
      shotsHit: 0,
      headshots: 0,
      backstabs: 0,
      airshots: 0,
    };
  }

  /**
   * Create empty class stats
   */
  private createEmptyClassStats(): InternalClassStats {
    return {
      weaponStatsMap: new Map(),
      kills: 0,
      deaths: 0,
      assists: 0,
      damage: 0,
      damageTaken: 0,
      healing: 0,
      ubers: 0,
      drops: 0,
      airshots: 0,
      headshots: 0,
      backstabs: 0,
      shotsFired: 0,
      shotsHit: 0,
      medkits: 0,
      medkitsHealth: 0,
      capturePointsCapped: 0,
      capturesBlocked: 0,
      buildingsBuilt: 0,
      buildingsDestroyed: 0,
    };
  }

  /**
   * Get or create player stats
   */
  private getPlayerStats(steamId: string, name: string, team: Team): PlayerState {
    if (!this.playerStats.has(steamId)) {
      this.playerStats.set(steamId, {
        steamId,
        name,
        team,
        primaryClass: 'undefined',
        classStatsMap: new Map(),
        classPlaytimeMap: new Map(),
        classesPlayedSet: new Set(),
        currentlyConnected: false,
        sessions: [],
      });
    }
    return this.playerStats.get(steamId)!;
  }

  /**
   * Get stats for a specific class (creates if doesn't exist)
   */
  private getClassStats(player: PlayerState, tf2Class: TF2Class): InternalClassStats {
    if (!player.classStatsMap.has(tf2Class)) {
      player.classStatsMap.set(tf2Class, this.createEmptyClassStats());
    }
    return player.classStatsMap.get(tf2Class)!;
  }

  /**
   * Get weapon stats for a specific class (creates if doesn't exist)
   */
  private getWeaponStats(classStats: InternalClassStats, weapon: string): InternalWeaponStats {
    if (!classStats.weaponStatsMap.has(weapon)) {
      classStats.weaponStatsMap.set(weapon, this.createEmptyWeaponStats());
    }
    return classStats.weaponStatsMap.get(weapon)!;
  }

  /**
   * Update a player's class and track playtime
   */
  private updatePlayerClass(player: PlayerState, newClass: TF2Class, timestamp: number): void {
    // If they were playing a class before, finalize that playtime
    if (player.currentClass && player.currentClassStartTime) {
      const duration = timestamp - player.currentClassStartTime;
      const currentPlaytime = player.classPlaytimeMap.get(player.currentClass) || 0;
      player.classPlaytimeMap.set(player.currentClass, currentPlaytime + duration);
    }

    // Track classes played
    player.classesPlayedSet.add(newClass);

    // Set primary class (most played will be determined at finalize)
    if (player.primaryClass === 'undefined') {
      player.primaryClass = newClass;
    }

    // Start tracking new class
    player.currentClass = newClass;
    player.currentClassStartTime = timestamp;
  }

  /**
   * Process a single event
   */
  processEvent(event: GameEvent): void {
    // Track match timing
    if (this.matchStartTime === 0 || event.timestamp < this.matchStartTime) {
      this.matchStartTime = event.timestamp;
    }
    if (event.timestamp > this.matchEndTime) {
      this.matchEndTime = event.timestamp;
    }

    // Process based on event type
    switch (event.type) {
      case 'player_connected':
        this.processPlayerConnected(event);
        break;
      case 'player_disconnected':
        this.processPlayerDisconnected(event);
        break;
      case 'player_spawn':
        this.processSpawn(event);
        break;
      case 'player_role_change':
        this.processRoleChange(event);
        break;
      case 'kill':
        this.processKill(event);
        break;
      case 'suicide':
        this.processSuicide(event);
        break;
      case 'damage':
        this.processDamage(event);
        break;
      case 'assist':
        this.processAssist(event);
        break;
      case 'heal':
        this.processHeal(event);
        break;
      case 'charge_deployed':
        this.processUber(event);
        break;
      case 'medic_death':
        this.processMedicDeath(event);
        break;
      case 'point_captured':
        this.processPointCapture(event);
        break;
      case 'capture_blocked':
        this.processCaptureBlock(event);
        break;
      case 'building_built':
        this.processBuildingBuilt(event);
        break;
      case 'building_killed':
        this.processBuildingDestroyed(event);
        break;
      case 'item_pickup':
        this.processItemPickup(event);
        break;
      case 'shot_fired':
        this.processShotFired(event);
        break;
      case 'shot_hit':
        this.processShotHit(event);
        break;
      case 'round_start':
        this.processRoundStart(event);
        break;
      case 'round_win':
        this.processRoundWin(event);
        break;
      case 'team_score':
        this.processTeamScore(event);
        break;
    }
  }

  private processPlayerConnected(event: PlayerConnectedEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (!player.currentlyConnected) {
      player.currentlyConnected = true;
      player.currentSessionStart = event.timestamp;

      if (!player.firstConnected) {
        player.firstConnected = event.timestamp;
      }

      player.sessions.push({
        connectedAt: event.timestamp,
      });
    }
  }

  private processPlayerDisconnected(event: PlayerDisconnectedEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (player.currentlyConnected) {
      // Finalize current class playtime
      if (player.currentClass && player.currentClassStartTime) {
        const duration = event.timestamp - player.currentClassStartTime;
        const currentPlaytime = player.classPlaytimeMap.get(player.currentClass) || 0;
        player.classPlaytimeMap.set(player.currentClass, currentPlaytime + duration);
      }

      // Finalize current session
      if (player.currentSessionStart && player.sessions.length > 0) {
        const currentSession = player.sessions[player.sessions.length - 1];
        currentSession.disconnectedAt = event.timestamp;
        currentSession.durationSeconds = event.timestamp - player.currentSessionStart;
      }

      player.currentlyConnected = false;
      player.lastDisconnected = event.timestamp;
      player.currentClass = undefined;
      player.currentClassStartTime = undefined;
      player.currentSessionStart = undefined;
    }
  }

  private processSpawn(event: PlayerSpawnEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    // Update team
    player.team = event.player.team;

    // If not connected yet, start a session
    if (!player.currentlyConnected) {
      player.currentlyConnected = true;
      player.currentSessionStart = event.timestamp;
      if (!player.firstConnected) {
        player.firstConnected = event.timestamp;
      }
      player.sessions.push({
        connectedAt: event.timestamp,
      });
    }

    // Handle class change from spawn
    this.updatePlayerClass(player, event.class, event.timestamp);
  }

  private processRoleChange(event: PlayerRoleChangeEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    // Handle class change
    this.updatePlayerClass(player, event.class, event.timestamp);
  }

  private processKill(event: KillEvent): void {
    // Only count kills during active rounds
    if (!this.gameIsActive) {
      return;
    }

    // Skip feign deaths (Dead Ringer fake deaths)
    if (event.customKill === 'feign_death') {
      return;
    }

    const killer = this.getPlayerStats(
      event.killer.steamId.id3,
      event.killer.name,
      event.killer.team
    );
    const victim = this.getPlayerStats(
      event.victim.steamId.id3,
      event.victim.name,
      event.victim.team
    );

    // Track per-class and per-weapon stats for killer
    if (killer.currentClass) {
      const killerClassStats = this.getClassStats(killer, killer.currentClass);
      const weaponStats = this.getWeaponStats(killerClassStats, event.weapon);

      killerClassStats.kills++;
      weaponStats.kills++;

      // Special kill types
      if (event.customKill === 'headshot') {
        killerClassStats.headshots++;
        weaponStats.headshots++;
      } else if (event.customKill === 'backstab') {
        killerClassStats.backstabs++;
        weaponStats.backstabs++;
      }
    }

    // Track deaths for victim
    if (victim.currentClass) {
      const victimClassStats = this.getClassStats(victim, victim.currentClass);
      victimClassStats.deaths++;
    }

    // Team stats
    const killerTeamStats = this.teamStats.get(event.killer.team);
    const victimTeamStats = this.teamStats.get(event.victim.team);
    if (killerTeamStats) killerTeamStats.kills++;
    if (victimTeamStats) victimTeamStats.deaths++;
  }

  private processSuicide(event: GameEvent): void {
    if (event.type !== 'suicide') return;

    // Only count suicides during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    // Track death for suicide
    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      classStats.deaths++;
    }

    // Team stats
    const teamStats = this.teamStats.get(event.player.team);
    if (teamStats) {
      teamStats.deaths++;
    }
  }

  private processDamage(event: DamageEvent): void {
    // Only count damage during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const attacker = this.getPlayerStats(
      event.attacker.steamId.id3,
      event.attacker.name,
      event.attacker.team
    );
    const victim = this.getPlayerStats(
      event.victim.steamId.id3,
      event.victim.name,
      event.victim.team
    );

    // Use damage field (capped at 450) to match logs.tf behavior
    // Sentry guns and some explosives can exceed 450, but logs.tf caps it
    let damageDealt = event.damage;
    if (damageDealt > 450) {
      damageDealt = 450;
    }

    // Track per-class and per-weapon stats for attacker
    if (attacker.currentClass) {
      const attackerClassStats = this.getClassStats(attacker, attacker.currentClass);
      const weaponStats = this.getWeaponStats(attackerClassStats, event.weapon);

      attackerClassStats.damage += damageDealt;
      weaponStats.damage += damageDealt;

      // Track airshots (headshots are only counted on kills, not damage)
      if (event.airshot) {
        attackerClassStats.airshots++;
        weaponStats.airshots++;
      }
    }

    // Track damage taken
    if (victim.currentClass) {
      const victimClassStats = this.getClassStats(victim, victim.currentClass);
      victimClassStats.damageTaken += damageDealt;
    }

    // Team stats
    const attackerTeamStats = this.teamStats.get(event.attacker.team);
    if (attackerTeamStats) {
      attackerTeamStats.damage += damageDealt;
    }
  }

  private processAssist(event: GameEvent): void {
    if (event.type !== 'assist') return;

    // Only count assists during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const assister = this.getPlayerStats(
      event.assister.steamId.id3,
      event.assister.name,
      event.assister.team
    );

    if (assister.currentClass) {
      const classStats = this.getClassStats(assister, assister.currentClass);
      classStats.assists++;
    }
  }

  private processHeal(event: HealEvent): void {
    // Only count healing during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const healer = this.getPlayerStats(
      event.healer.steamId.id3,
      event.healer.name,
      event.healer.team
    );

    if (healer.currentClass) {
      const classStats = this.getClassStats(healer, healer.currentClass);
      classStats.healing += event.healing;
    }

    // Team stats
    const teamStats = this.teamStats.get(event.healer.team);
    if (teamStats) {
      teamStats.healing += event.healing;
    }
  }

  private processUber(event: ChargeDeployedEvent): void {
    // Only count ubers during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const medic = this.getPlayerStats(
      event.medic.steamId.id3,
      event.medic.name,
      event.medic.team
    );

    if (medic.currentClass) {
      const classStats = this.getClassStats(medic, medic.currentClass);
      classStats.ubers++;
    }

    // Team stats
    const teamStats = this.teamStats.get(event.medic.team);
    if (teamStats) {
      teamStats.ubers++;
    }
  }

  private processMedicDeath(event: MedicDeathEvent): void {
    // Only count drops during active rounds
    if (!this.gameIsActive) {
      return;
    }

    if (event.uberCharge) {
      const medic = this.getPlayerStats(
        event.medic.steamId.id3,
        event.medic.name,
        event.medic.team
      );

      if (medic.currentClass) {
        const classStats = this.getClassStats(medic, medic.currentClass);
        classStats.drops++;
      }

      // Team stats
      const teamStats = this.teamStats.get(event.medic.team);
      if (teamStats) {
        teamStats.drops++;
      }
    }
  }

  private processPointCapture(event: PointCapturedEvent): void {
    // Only count point captures during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const teamStats = this.teamStats.get(event.team);
    if (teamStats) {
      teamStats.capturePoints++;
    }

    // Track individual cappers
    for (const capper of event.cappers) {
      const player = this.getPlayerStats(
        capper.player.steamId.id3,
        capper.player.name,
        capper.player.team
      );

      if (player.currentClass) {
        const classStats = this.getClassStats(player, player.currentClass);
        classStats.capturePointsCapped++;
      }
    }
  }

  private processCaptureBlock(event: CaptureBlockedEvent): void {
    // Only count captures blocked during active rounds
    if (!this.gameIsActive) {
      return;
    }

    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      classStats.capturesBlocked++;
    }
  }

  private processBuildingBuilt(event: BuildingBuiltEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      classStats.buildingsBuilt++;
    }
  }

  private processBuildingDestroyed(event: BuildingKilledEvent): void {
    const player = this.getPlayerStats(
      event.attacker.steamId.id3,
      event.attacker.name,
      event.attacker.team
    );

    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      classStats.buildingsDestroyed++;
    }
  }

  private processItemPickup(event: ItemPickupEvent): void {
    if (event.item.includes('health') || event.item.includes('medkit')) {
      const player = this.getPlayerStats(
        event.player.steamId.id3,
        event.player.name,
        event.player.team
      );

      if (player.currentClass) {
        const classStats = this.getClassStats(player, player.currentClass);

        // Medkit count based on size: small=1, medium=2, large=4
        let medkitCount = 1; // default
        if (event.item.includes('medkit_small')) {
          medkitCount = 1;
        } else if (event.item.includes('medkit_medium')) {
          medkitCount = 2;
        } else if (event.item.includes('medkit_large')) {
          medkitCount = 4;
        }

        classStats.medkits += medkitCount;
        if (event.healing) {
          classStats.medkitsHealth += event.healing;
        }
      }
    }
  }

  private processShotFired(event: ShotFiredEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      const weaponStats = this.getWeaponStats(classStats, event.weapon);

      classStats.shotsFired++;
      weaponStats.shotsFired++;
    }
  }

  private processShotHit(event: ShotHitEvent): void {
    const player = this.getPlayerStats(
      event.player.steamId.id3,
      event.player.name,
      event.player.team
    );

    if (player.currentClass) {
      const classStats = this.getClassStats(player, player.currentClass);
      const weaponStats = this.getWeaponStats(classStats, event.weapon);

      classStats.shotsHit++;
      weaponStats.shotsHit++;
    }
  }

  private processRoundStart(event: GameEvent): void {
    if (event.type !== 'round_start') return;
    this.gameIsActive = true;
  }

  private processRoundWin(event: GameEvent): void {
    if (event.type !== 'round_win') return;

    this.gameIsActive = false;
    this.pendingRoundScoreSave = true;

    if (event.winner === 'red') {
      this.roundWins.red++;
    } else if (event.winner === 'blue') {
      this.roundWins.blue++;
    }

    if (this.roundWins.red > this.roundWins.blue) {
      this.winner = 'red';
    } else if (this.roundWins.blue > this.roundWins.red) {
      this.winner = 'blue';
    } else {
      this.winner = undefined;
    }
  }

  private processTeamScore(event: GameEvent): void {
    if (event.type !== 'team_score') return;
    const teamStats = this.teamStats.get(event.team);

    if (event.team === 'red') {
      this.currentRoundScore.red = event.score;
    } else if (event.team === 'blue') {
      this.currentRoundScore.blue = event.score;
    }

    if (!event.isFinal && this.pendingRoundScoreSave) {
      const lastSaved = this.roundScores[this.roundScores.length - 1];

      if (!lastSaved ||
          lastSaved.red !== this.currentRoundScore.red ||
          lastSaved.blue !== this.currentRoundScore.blue) {
        this.roundScores.push({ ...this.currentRoundScore });
        this.pendingRoundScoreSave = false;
      }
    }

    if (teamStats && event.isFinal) {
      teamStats.score = event.score;
    }
  }

  /**
   * Finalize and return game totals
   * @param rounds - Round data from RoundAggregator
   */
  finalize(rounds: Round[]): GameTotals {
    const finalizedPlayers: PlayerGameTotals[] = [];

    for (const player of this.playerStats.values()) {
      // Finalize any remaining class playtime and sessions
      if (player.currentlyConnected && this.matchEndTime) {
        if (player.currentClass && player.currentClassStartTime) {
          const duration = this.matchEndTime - player.currentClassStartTime;
          const currentPlaytime = player.classPlaytimeMap.get(player.currentClass) || 0;
          player.classPlaytimeMap.set(player.currentClass, currentPlaytime + duration);
        }

        if (player.currentSessionStart && player.sessions.length > 0) {
          const currentSession = player.sessions[player.sessions.length - 1];
          if (!currentSession.disconnectedAt) {
            currentSession.disconnectedAt = this.matchEndTime;
            currentSession.durationSeconds = this.matchEndTime - player.currentSessionStart;
          }
        }
      }

      // Calculate total playtime from all sessions
      const totalPlaytimeSeconds = player.sessions.reduce((sum, session) => {
        return sum + (session.durationSeconds || 0);
      }, 0);

      // Build per-class stats array
      const classes: ClassStats[] = [];
      const classesArray = Array.from(player.classesPlayedSet);

      for (const tf2Class of classesArray) {
        const classStats = player.classStatsMap.get(tf2Class) || this.createEmptyClassStats();
        const playtimeSeconds = player.classPlaytimeMap.get(tf2Class) || 0;

        // Build weapon stats array for this class
        const weapons: WeaponStats[] = [];
        for (const [weaponName, weaponStats] of classStats.weaponStatsMap.entries()) {
          let weaponAccuracy: number | undefined;
          if (weaponStats.shotsFired > 0 && weaponStats.shotsHit > 0) {
            weaponAccuracy = parseFloat((weaponStats.shotsHit / weaponStats.shotsFired).toFixed(2));  // Keep as 0-1 ratio
          }

          weapons.push({
            weapon: weaponName,
            kills: weaponStats.kills,
            damage: weaponStats.damage,
            shotsFired: weaponStats.shotsFired > 0 ? weaponStats.shotsFired : undefined,
            shotsHit: weaponStats.shotsHit > 0 ? weaponStats.shotsHit : undefined,
            accuracy: weaponAccuracy,
            headshots: weaponStats.headshots > 0 ? weaponStats.headshots : undefined,
            backstabs: weaponStats.backstabs > 0 ? weaponStats.backstabs : undefined,
            airshots: weaponStats.airshots > 0 ? weaponStats.airshots : undefined,
          });
        }

        // Sort weapons by damage (most damaging first)
        weapons.sort((a, b) => b.damage - a.damage);

        // Calculate accuracy for this class
        let classAccuracy: number | undefined;
        if (classStats.shotsFired > 0 && classStats.shotsHit > 0) {
          classAccuracy = parseFloat((classStats.shotsHit / classStats.shotsFired).toFixed(2));  // Keep as 0-1 ratio
        }

        classes.push({
          class: tf2Class,
          playtimeSeconds,
          weapons,
          kills: classStats.kills,
          deaths: classStats.deaths,
          assists: classStats.assists,
          damage: classStats.damage,
          damageTaken: classStats.damageTaken,
          healing: classStats.healing > 0 ? classStats.healing : undefined,
          ubers: classStats.ubers > 0 ? classStats.ubers : undefined,
          drops: classStats.drops > 0 ? classStats.drops : undefined,
          airshots: classStats.airshots > 0 ? classStats.airshots : undefined,
          headshots: classStats.headshots > 0 ? classStats.headshots : undefined,
          backstabs: classStats.backstabs > 0 ? classStats.backstabs : undefined,
          shotsFired: classStats.shotsFired > 0 ? classStats.shotsFired : undefined,
          shotsHit: classStats.shotsHit > 0 ? classStats.shotsHit : undefined,
          accuracy: classAccuracy,
          medkits: classStats.medkits,
          medkitsHealth: classStats.medkitsHealth,
          capturePointsCapped: classStats.capturePointsCapped,
          capturesBlocked: classStats.capturesBlocked,
          buildingsBuilt: classStats.buildingsBuilt,
          buildingsDestroyed: classStats.buildingsDestroyed,
        });
      }

      // Sort by playtime (most played first)
      classes.sort((a, b) => b.playtimeSeconds - a.playtimeSeconds);

      // Determine primary class (most played)
      if (classes.length > 0) {
        player.primaryClass = classes[0].class;
      }

      // Calculate overall totals (sum across all classes)
      let totalKills = 0, totalDeaths = 0, totalAssists = 0;
      let totalDamage = 0, totalDamageTaken = 0;
      let totalHealing = 0, totalUbers = 0, totalDrops = 0;
      let totalAirshots = 0, totalHeadshots = 0, totalBackstabs = 0;
      let totalShotsFired = 0, totalShotsHit = 0;
      let totalMedkits = 0, totalMedkitsHealth = 0;
      let totalCaps = 0, totalBlocks = 0;
      let totalBuilt = 0, totalDestroyed = 0;

      for (const classStats of classes) {
        totalKills += classStats.kills;
        totalDeaths += classStats.deaths;
        totalAssists += classStats.assists;
        totalDamage += classStats.damage;
        totalDamageTaken += classStats.damageTaken;
        totalHealing += classStats.healing || 0;
        totalUbers += classStats.ubers || 0;
        totalDrops += classStats.drops || 0;
        totalAirshots += classStats.airshots || 0;
        totalHeadshots += classStats.headshots || 0;
        totalBackstabs += classStats.backstabs || 0;
        totalShotsFired += classStats.shotsFired || 0;
        totalShotsHit += classStats.shotsHit || 0;
        totalMedkits += classStats.medkits;
        totalMedkitsHealth += classStats.medkitsHealth;
        totalCaps += classStats.capturePointsCapped;
        totalBlocks += classStats.capturesBlocked;
        totalBuilt += classStats.buildingsBuilt;
        totalDestroyed += classStats.buildingsDestroyed;
      }

      // Calculate overall accuracy
      let overallAccuracy: number | undefined;
      if (totalShotsFired > 0 && totalShotsHit > 0) {
        overallAccuracy = parseFloat((totalShotsHit / totalShotsFired).toFixed(2));  // Keep as 0-1 ratio
      }

      // Build final player object
      finalizedPlayers.push({
        steamId: player.steamId,
        name: player.name,
        team: player.team,
        primaryClass: player.primaryClass,
        totalPlaytimeSeconds,
        classesPlayed: classesArray,
        sessions: player.sessions,
        classes,
        kills: totalKills,
        deaths: totalDeaths,
        assists: totalAssists,
        damage: totalDamage,
        damageTaken: totalDamageTaken,
        healing: totalHealing > 0 ? totalHealing : undefined,
        ubers: totalUbers > 0 ? totalUbers : undefined,
        drops: totalDrops > 0 ? totalDrops : undefined,
        airshots: totalAirshots > 0 ? totalAirshots : undefined,
        headshots: totalHeadshots > 0 ? totalHeadshots : undefined,
        backstabs: totalBackstabs > 0 ? totalBackstabs : undefined,
        shotsFired: totalShotsFired > 0 ? totalShotsFired : undefined,
        shotsHit: totalShotsHit > 0 ? totalShotsHit : undefined,
        accuracy: overallAccuracy,
        medkits: totalMedkits,
        medkitsHealth: totalMedkitsHealth,
        capturePointsCapped: totalCaps,
        capturesBlocked: totalBlocks,
        buildingsBuilt: totalBuilt,
        buildingsDestroyed: totalDestroyed,
      });
    }

    // Filter valid rounds and determine winner
    const validRounds = filterValidRounds(rounds, this.map);
    const winner = determineWinner(rounds, this.map);

    // Count round wins from valid rounds only
    const redWins = validRounds.filter(r => r.winner === 'red').length;
    const blueWins = validRounds.filter(r => r.winner === 'blue').length;

    return {
      logId: this.logId,
      map: this.map,
      title: this.title,
      duration: this.matchEndTime - this.matchStartTime,
      startTime: this.matchStartTime,
      endTime: this.matchEndTime,
      winner,
      teams: {
        red: this.teamStats.get('red')!,
        blue: this.teamStats.get('blue')!,
      },
      players: finalizedPlayers,
      rounds: {
        total: validRounds.length,
        redWins,
        blueWins,
      },
    };
  }
}

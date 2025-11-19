/**
 * Player stats aggregator - Builds player statistics from events
 */

import { GameEvent, TF2Class, Team, PlayerIdentifier } from '../types/events';
import { PlayerStats, ClassStats, WeaponStats, MedicStats } from '../types/player';

export class PlayerAggregator {
  private players: Map<string, PlayerStats>;

  constructor() {
    this.players = new Map();
  }

  /**
   * Initialize a new player or return existing
   */
  private getOrCreatePlayer(
    steamId64: string,
    playerData?: PlayerIdentifier & { timestamp: number }
  ): PlayerStats {
    if (this.players.has(steamId64)) {
      return this.players.get(steamId64)!;
    }

    const newPlayer: PlayerStats = {
      steamId: playerData
        ? playerData.steamId
        : { id3: '', id64: steamId64 },
      userName: playerData?.name || 'Unknown',
      team: playerData?.team || 'unknown',
      primaryClass: 'undefined',
      joinedGame: playerData?.timestamp || 0,
      leftGame: null,
      playtime: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      suicides: 0,
      damage: 0,
      damageReal: 0,
      damageTaken: 0,
      damageTakenReal: 0,
      damagePerMinute: 0,
      damageTakenPerMinute: 0,
      killsPerDeath: 0,
      killAssistsPerDeath: 0,
      heals: 0,
      healsPerMinute: 0,
      crossbowHealing: 0,
      medicStats: {
        ubers: 0,
        drops: 0,
        uberLength: 0,
        nearFullDeaths: 0,
        healAfterSpawn: 0,
        uberTypes: {},
        averageUberLength: 0,
      },
      medicPicks: 0,
      medicDrops: 0,
      headshots: 0,
      headshotKills: 0,
      backstabs: 0,
      airshots: 0,
      pointCaps: 0,
      capturesBlocked: 0,
      extinguished: 0,
      dominated: 0,
      revenged: 0,
      buildingKills: 0,
      buildings: 0,
      uberHits: 0,
      deathScreenTime: 0,
      classStats: {} as Record<TF2Class, ClassStats>,
      damageDivision: {
        damageTo: {},
        damageFrom: {},
      },
      resupply: {
        medkit: 0,
        medkitsHealingDone: 0,
        ammo: 0,
      },
      combatScore: 0,
      roundPerformance: {},
    };

    this.players.set(steamId64, newPlayer);
    return newPlayer;
  }

  /**
   * Get or create class stats for a player
   */
  private getOrCreateClassStats(player: PlayerStats, className: TF2Class): ClassStats {
    if (!player.classStats[className]) {
      player.classStats[className] = {
        kills: 0,
        assists: 0,
        deaths: 0,
        damage: 0,
        damageTaken: 0,
        heals: 0,
        weapons: {},
        playtime: 0,
      };
    }
    return player.classStats[className];
  }

  /**
   * Get or create weapon stats
   */
  private getOrCreateWeaponStats(
    classStats: ClassStats,
    weapon: string
  ): WeaponStats {
    if (!classStats.weapons[weapon]) {
      classStats.weapons[weapon] = {
        kills: 0,
        damage: 0,
        shotsFired: 0,
        shotsHit: 0,
        accuracy: 0,
      };
    }
    return classStats.weapons[weapon];
  }

  /**
   * Process a single event
   */
  processEvent(event: GameEvent, currentRound: number): void {
    switch (event.type) {
      case 'player_connected':
        this.handlePlayerConnected(event);
        break;

      case 'player_disconnected':
        this.handlePlayerDisconnected(event);
        break;

      case 'kill':
        this.handleKill(event, currentRound);
        break;

      case 'damage':
        this.handleDamage(event);
        break;

      case 'assist':
        this.handleAssist(event, currentRound);
        break;

      case 'suicide':
        this.handleSuicide(event);
        break;

      case 'shot_fired':
        this.handleShotFired(event);
        break;

      case 'shot_hit':
        this.handleShotHit(event);
        break;

      case 'heal':
        this.handleHeal(event);
        break;

      case 'charge_deployed':
        this.handleChargeDeployed(event);
        break;

      case 'charge_ended':
        this.handleChargeEnded(event);
        break;

      case 'medic_death':
        this.handleMedicDeath(event);
        break;

      case 'first_heal_after_spawn':
        this.handleFirstHealAfterSpawn(event);
        break;

      case 'point_captured':
        this.handlePointCaptured(event);
        break;

      case 'capture_blocked':
        this.handleCaptureBlocked(event);
        break;

      case 'building_built':
        this.handleBuildingBuilt(event);
        break;

      case 'building_killed':
        this.handleBuildingKilled(event);
        break;

      case 'domination':
        this.handleDomination(event);
        break;

      case 'revenge':
        this.handleRevenge(event);
        break;

      case 'extinguish':
        this.handleExtinguish(event);
        break;

      case 'item_pickup':
        this.handleItemPickup(event);
        break;
    }
  }

  private handlePlayerConnected(event: Extract<GameEvent, { type: 'player_connected' }>): void {
    this.getOrCreatePlayer(event.player.steamId.id64, {
      ...event.player,
      timestamp: event.timestamp,
    });
  }

  private handlePlayerDisconnected(event: Extract<GameEvent, { type: 'player_disconnected' }>): void {
    const player = this.getOrCreatePlayer(event.player.steamId.id64);
    player.leftGame = event.timestamp;
  }

  private handleKill(event: Extract<GameEvent, { type: 'kill' }>, currentRound: number): void {
    const killer = this.getOrCreatePlayer(event.killer.steamId.id64);
    const victim = this.getOrCreatePlayer(event.victim.steamId.id64);

    killer.kills++;
    victim.deaths++;

    // Update round performance
    if (!killer.roundPerformance[currentRound]) {
      killer.roundPerformance[currentRound] = { kills: 0, deaths: 0, damage: 0, heals: 0 };
    }
    if (!victim.roundPerformance[currentRound]) {
      victim.roundPerformance[currentRound] = { kills: 0, deaths: 0, damage: 0, heals: 0 };
    }
    killer.roundPerformance[currentRound].kills++;
    victim.roundPerformance[currentRound].deaths++;

    // Track custom kills
    if (event.customKill === 'headshot') {
      killer.headshotKills++;
    } else if (event.customKill === 'backstab') {
      killer.backstabs++;
    }

    // Medic pick tracking
    // Note: Would need to know victim's current class from state tracking
  }

  private handleDamage(event: Extract<GameEvent, { type: 'damage' }>): void {
    const attacker = this.getOrCreatePlayer(event.attacker.steamId.id64);
    const victim = this.getOrCreatePlayer(event.victim.steamId.id64);

    // Cap damage at 450 (matches old parser logic)
    const damage = Math.min(event.damage, 450);
    const realDamage = Math.min(event.realDamage || event.damage, 450);

    attacker.damage += damage;
    attacker.damageReal += realDamage;
    victim.damageTaken += damage;
    victim.damageTakenReal += realDamage;

    // Track uber hits (0 damage)
    if (event.damage === 0) {
      attacker.uberHits++;
    }

    // Track headshots and airshots
    if (event.headshot) {
      attacker.headshots++;
    }
    if (event.airshot) {
      attacker.airshots++;
    }

    // Damage division
    attacker.damageDivision.damageTo[victim.steamId.id64] =
      (attacker.damageDivision.damageTo[victim.steamId.id64] || 0) + damage;
    victim.damageDivision.damageFrom[attacker.steamId.id64] =
      (victim.damageDivision.damageFrom[attacker.steamId.id64] || 0) + damage;
  }

  private handleAssist(event: Extract<GameEvent, { type: 'assist' }>, currentRound: number): void {
    const assister = this.getOrCreatePlayer(event.assister.steamId.id64);
    assister.assists++;

    if (!assister.roundPerformance[currentRound]) {
      assister.roundPerformance[currentRound] = { kills: 0, deaths: 0, damage: 0, heals: 0 };
    }
  }

  private handleSuicide(event: Extract<GameEvent, { type: 'suicide' }>): void {
    const player = this.getOrCreatePlayer(event.player.steamId.id64);
    player.suicides++;
  }

  private handleShotFired(event: Extract<GameEvent, { type: 'shot_fired' }>): void {
    // Weapon stats would need current class context
  }

  private handleShotHit(event: Extract<GameEvent, { type: 'shot_hit' }>): void {
    // Weapon stats would need current class context
  }

  private handleHeal(event: Extract<GameEvent, { type: 'heal' }>): void {
    const healer = this.getOrCreatePlayer(event.healer.steamId.id64);
    healer.heals += event.healing;

    if (event.crossbow) {
      healer.crossbowHealing += event.healing;
    }
    if (event.airshot) {
      healer.airshots++;
    }
  }

  private handleChargeDeployed(event: Extract<GameEvent, { type: 'charge_deployed' }>): void {
    const medic = this.getOrCreatePlayer(event.medic.steamId.id64);
    medic.medicStats.ubers++;
    medic.medicStats.uberTypes[event.medigun] =
      (medic.medicStats.uberTypes[event.medigun] || 0) + 1;
  }

  private handleChargeEnded(event: Extract<GameEvent, { type: 'charge_ended' }>): void {
    const medic = this.getOrCreatePlayer(event.medic.steamId.id64);
    medic.medicStats.uberLength += event.duration;
  }

  private handleMedicDeath(event: Extract<GameEvent, { type: 'medic_death' }>): void {
    const killer = this.getOrCreatePlayer(event.killer.steamId.id64);
    const medic = this.getOrCreatePlayer(event.medic.steamId.id64);

    killer.medicPicks++;

    if (event.uberCharge) {
      killer.medicDrops++;
      medic.medicStats.drops++;
    }

    if (event.uberPct && event.uberPct >= 90) {
      medic.medicStats.nearFullDeaths++;
    }
  }

  private handleFirstHealAfterSpawn(event: Extract<GameEvent, { type: 'first_heal_after_spawn' }>): void {
    const medic = this.getOrCreatePlayer(event.medic.steamId.id64);
    medic.medicStats.healAfterSpawn += event.time;
  }

  private handlePointCaptured(event: Extract<GameEvent, { type: 'point_captured' }>): void {
    for (const capper of event.cappers) {
      const player = this.getOrCreatePlayer(capper.player.steamId.id64);
      player.pointCaps++;
    }
  }

  private handleCaptureBlocked(event: Extract<GameEvent, { type: 'capture_blocked' }>): void {
    const player = this.getOrCreatePlayer(event.player.steamId.id64);
    player.capturesBlocked++;
  }

  private handleBuildingBuilt(event: Extract<GameEvent, { type: 'building_built' }>): void {
    const player = this.getOrCreatePlayer(event.player.steamId.id64);
    player.buildings++;
  }

  private handleBuildingKilled(event: Extract<GameEvent, { type: 'building_killed' }>): void {
    const attacker = this.getOrCreatePlayer(event.attacker.steamId.id64);
    attacker.buildingKills++;
  }

  private handleDomination(event: Extract<GameEvent, { type: 'domination' }>): void {
    const dominator = this.getOrCreatePlayer(event.dominator.steamId.id64);
    dominator.dominated++;
  }

  private handleRevenge(event: Extract<GameEvent, { type: 'revenge' }>): void {
    const avenger = this.getOrCreatePlayer(event.avenger.steamId.id64);
    avenger.revenged++;
  }

  private handleExtinguish(event: Extract<GameEvent, { type: 'extinguish' }>): void {
    const extinguisher = this.getOrCreatePlayer(event.extinguisher.steamId.id64);
    extinguisher.extinguished++;
  }

  private handleItemPickup(event: Extract<GameEvent, { type: 'item_pickup' }>): void {
    const player = this.getOrCreatePlayer(event.player.steamId.id64);

    if (event.item.includes('medkit')) {
      player.resupply.medkit++;
      if (event.healing) {
        player.resupply.medkitsHealingDone += event.healing;
      }
    } else if (event.item.includes('ammo')) {
      player.resupply.ammo++;
    }
  }

  /**
   * Get all players
   */
  getPlayers(): Record<string, PlayerStats> {
    const result: Record<string, PlayerStats> = {};
    this.players.forEach((player, id) => {
      result[id] = player;
    });
    return result;
  }

  /**
   * Finalize player stats (calculate derived stats)
   */
  finalizeStats(matchDuration: number): void {
    const minutesInMatch = matchDuration / 60;

    this.players.forEach((player) => {
      // Calculate per-minute stats
      player.damagePerMinute = Math.round(player.damage / minutesInMatch);
      player.damageTakenPerMinute = Math.round(player.damageTaken / minutesInMatch);
      player.healsPerMinute = Math.round(player.heals / minutesInMatch);

      // Calculate K/D ratios
      player.killsPerDeath = player.deaths > 0 ? player.kills / player.deaths : player.kills;
      player.killAssistsPerDeath =
        player.deaths > 0 ? (player.kills + player.assists) / player.deaths : player.kills + player.assists;

      // Calculate average uber length
      if (player.medicStats.ubers > 0) {
        player.medicStats.averageUberLength = player.medicStats.uberLength / player.medicStats.ubers;
      }

      // Round to 2 decimal places
      player.killsPerDeath = Math.round(player.killsPerDeath * 100) / 100;
      player.killAssistsPerDeath = Math.round(player.killAssistsPerDeath * 100) / 100;
    });
  }
}

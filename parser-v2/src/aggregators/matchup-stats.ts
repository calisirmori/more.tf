/**
 * Matchup Stats Aggregator
 * Tracks player-vs-player and player-vs-class interactions
 */

import { TF2Class } from '../types/events';
import { GameEvent, KillEvent, DamageEvent, HealEvent, AssistEvent, PlayerSpawnEvent, PlayerRoleChangeEvent } from '../types/events';

export interface PlayerMatchup {
  kills: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  assists: number;
  healing: number;
}

export interface ClassMatchup {
  kills: number;
  deaths: number;
  damage: number;
  damageTaken: number;
  assists: number;
  healing: number;
}

export interface PlayerMatchupStats {
  steamId: string;
  // name removed - frontend will look up from playerNames map

  // Player vs Player matchups
  // Key: opponent steamId, Value: stats against that player
  vsPlayers: Record<string, PlayerMatchup>;

  // Player vs Class matchups
  // Key: opponent class, Value: aggregated stats against that class
  vsClasses: Record<TF2Class, ClassMatchup>;
}

export interface MatchupStats {
  // Array of all players with their matchup stats
  players: PlayerMatchupStats[];
}

export class MatchupStatsAggregator {
  private playerMatchups: Map<string, PlayerMatchupStats> = new Map();
  private playerClasses: Map<string, TF2Class> = new Map(); // Track current class for each player

  /**
   * Get or create player matchup stats
   */
  private getPlayerMatchup(steamId: string): PlayerMatchupStats {
    if (!this.playerMatchups.has(steamId)) {
      this.playerMatchups.set(steamId, {
        steamId,
        vsPlayers: {},
        vsClasses: {} as Record<TF2Class, ClassMatchup>,
      });
    }
    return this.playerMatchups.get(steamId)!;
  }

  /**
   * Get or create player-vs-player matchup
   */
  private getPlayerVsPlayer(attackerStats: PlayerMatchupStats, victimId: string): PlayerMatchup {
    if (!attackerStats.vsPlayers[victimId]) {
      attackerStats.vsPlayers[victimId] = {
        kills: 0,
        deaths: 0,
        damage: 0,
        damageTaken: 0,
        assists: 0,
        healing: 0,
      };
    }
    return attackerStats.vsPlayers[victimId];
  }

  /**
   * Get or create player-vs-class matchup
   */
  private getPlayerVsClass(playerStats: PlayerMatchupStats, opponentClass: TF2Class): ClassMatchup {
    if (!playerStats.vsClasses[opponentClass]) {
      playerStats.vsClasses[opponentClass] = {
        kills: 0,
        deaths: 0,
        damage: 0,
        damageTaken: 0,
        assists: 0,
        healing: 0,
      };
    }
    return playerStats.vsClasses[opponentClass];
  }

  /**
   * Process a game event to extract matchup stats
   */
  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'player_spawn':
        // Track player class changes
        this.playerClasses.set((event as PlayerSpawnEvent).player.steamId.id3, (event as PlayerSpawnEvent).class);
        break;
      case 'player_role_change':
        // Track class changes
        this.playerClasses.set((event as PlayerRoleChangeEvent).player.steamId.id3, (event as PlayerRoleChangeEvent).class);
        break;
      case 'kill':
        this.processKill(event);
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
    }
  }

  private processKill(event: KillEvent): void {
    const killer = this.getPlayerMatchup(event.killer.steamId.id3);
    const victim = this.getPlayerMatchup(event.victim.steamId.id3);

    // Player vs Player
    const killerVsVictim = this.getPlayerVsPlayer(killer, event.victim.steamId.id3);
    const victimVsKiller = this.getPlayerVsPlayer(victim, event.killer.steamId.id3);

    killerVsVictim.kills++;
    victimVsKiller.deaths++;

    // Player vs Class
    const victimClass = this.playerClasses.get(event.victim.steamId.id3);
    if (victimClass) {
      const killerVsClass = this.getPlayerVsClass(killer, victimClass);
      killerVsClass.kills++;
    }

    const killerClass = this.playerClasses.get(event.killer.steamId.id3);
    if (killerClass) {
      const victimVsClass = this.getPlayerVsClass(victim, killerClass);
      victimVsClass.deaths++;
    }
  }

  private processDamage(event: DamageEvent): void {
    const attacker = this.getPlayerMatchup(event.attacker.steamId.id3);
    const victim = this.getPlayerMatchup(event.victim.steamId.id3);

    // Player vs Player
    const attackerVsVictim = this.getPlayerVsPlayer(attacker, event.victim.steamId.id3);
    const victimVsAttacker = this.getPlayerVsPlayer(victim, event.attacker.steamId.id3);

    attackerVsVictim.damage += event.damage;
    victimVsAttacker.damageTaken += event.damage;

    // Player vs Class
    const victimClass = this.playerClasses.get(event.victim.steamId.id3);
    if (victimClass) {
      const attackerVsClass = this.getPlayerVsClass(attacker, victimClass);
      attackerVsClass.damage += event.damage;
    }

    const attackerClass = this.playerClasses.get(event.attacker.steamId.id3);
    if (attackerClass) {
      const victimVsClass = this.getPlayerVsClass(victim, attackerClass);
      victimVsClass.damageTaken += event.damage;
    }
  }

  private processAssist(event: AssistEvent): void {
    const assister = this.getPlayerMatchup(event.assister.steamId.id3);
    const victim = this.getPlayerMatchup(event.victim.steamId.id3);

    // Player vs Player
    const assisterVsVictim = this.getPlayerVsPlayer(assister, event.victim.steamId.id3);
    assisterVsVictim.assists++;

    // Player vs Class
    const victimClass = this.playerClasses.get(event.victim.steamId.id3);
    if (victimClass) {
      const assisterVsClass = this.getPlayerVsClass(assister, victimClass);
      assisterVsClass.assists++;
    }
  }

  private processHeal(event: HealEvent): void {
    const healer = this.getPlayerMatchup(event.healer.steamId.id3);
    const target = this.getPlayerMatchup(event.target.steamId.id3);

    // Player vs Player (healing is tracked from healer's perspective)
    const healerVsTarget = this.getPlayerVsPlayer(healer, event.target.steamId.id3);
    healerVsTarget.healing += event.healing;

    // Player vs Class (how much healer healed each class)
    const targetClass = this.playerClasses.get(event.target.steamId.id3);
    if (targetClass) {
      const healerVsClass = this.getPlayerVsClass(healer, targetClass);
      healerVsClass.healing += event.healing;
    }
  }

  /**
   * Finalize and return matchup stats
   */
  finalize(): MatchupStats {
    const players: PlayerMatchupStats[] = Array.from(this.playerMatchups.values());

    return {
      players,
    };
  }
}

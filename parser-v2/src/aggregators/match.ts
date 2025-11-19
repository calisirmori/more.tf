/**
 * Match aggregator - Builds complete match data
 */

import { GameEvent, Team } from '../types/events';
import {
  ParsedMatch,
  TeamStats,
  MatchInfo,
  IntervalData,
  KillStreak,
} from '../types/match';
import { PlayerAggregator } from './player';
import { RoundAggregator } from './round';
import { HealSpread, KillSpread, AssistSpread } from '../types/player';

export class MatchAggregator {
  private playerAgg: PlayerAggregator;
  private roundAgg: RoundAggregator;

  private logId: number;
  private map: string;
  private title: string;
  private startTime: number = 0;
  private endTime: number = 0;

  private teamStats: {
    red: TeamStats;
    blue: TeamStats;
  };

  private chat: Array<{
    steamId64: string;
    timestamp: number;
    message: string;
  }> = [];

  private healSpread: HealSpread = {};
  private killSpread: KillSpread = {};
  private assistSpread: AssistSpread = {};

  private damagePerInterval: IntervalData = { red: [], blue: [] };
  private healsPerInterval: IntervalData = { red: [], blue: [] };

  private killStreaks: Record<string, KillStreak[]> = {};

  private pauseData = {
    lastPause: 0,
    pauseSum: 0,
  };

  private gameActive: boolean = false; // Wait for first Round_Start to begin counting
  private lastRoundLength: number = 0; // Store round_length for when round_win occurs

  // Track player state (name, team, class)
  private playerState: Map<string, {
    name: string;
    team: Team;
    currentClass: string;
  }> = new Map();

  constructor(logId: number, map: string, title: string) {
    this.logId = logId;
    this.map = map;
    this.title = title;

    this.playerAgg = new PlayerAggregator();
    this.roundAgg = new RoundAggregator();

    this.teamStats = {
      red: this.createEmptyTeamStats(),
      blue: this.createEmptyTeamStats(),
    };
  }

  private createEmptyTeamStats(): TeamStats {
    return {
      score: 0,
      kills: 0,
      damage: 0,
      heals: 0,
      charges: 0,
      drops: 0,
      firstcaps: 0,
      caps: 0,
    };
  }

  /**
   * Process a single event
   */
  processEvent(event: GameEvent): void {
    // Update timestamps
    if (this.startTime === 0) {
      this.startTime = event.timestamp;
    }
    this.endTime = event.timestamp;

    // Process based on event type
    switch (event.type) {
      case 'player_connected':
      case 'player_role_change':
      case 'player_team_change':
        this.handlePlayerState(event);
        break;

      case 'round_start':
        this.handleRoundStart(event);
        break;

      case 'round_win':
        this.handleRoundWin(event);
        break;

      case 'round_length':
        this.handleRoundLength(event);
        break;

      case 'round_overtime':
        this.roundAgg.setOvertime();
        break;

      case 'team_score':
        this.handleTeamScore(event);
        break;

      case 'pause':
        this.pauseData.lastPause = event.timestamp;
        break;

      case 'unpause':
        this.pauseData.pauseSum += event.timestamp - this.pauseData.lastPause;
        break;

      case 'chat':
        this.handleChat(event);
        break;

      case 'kill':
        if (this.gameActive) this.handleKill(event);
        break;

      case 'damage':
        if (this.gameActive) this.handleDamage(event);
        break;

      case 'assist':
        if (this.gameActive) this.handleAssist(event);
        break;

      case 'heal':
        if (this.gameActive) this.handleHeal(event);
        break;

      case 'charge_deployed':
        if (this.gameActive) this.handleChargeDeployed(event);
        break;

      case 'medic_death':
        if (this.gameActive) this.handleMedicDeath(event);
        break;

      case 'point_captured':
        if (this.gameActive) this.handlePointCaptured(event);
        break;
    }

    // Pass to player aggregator (only during active rounds)
    if (this.gameActive) {
      this.playerAgg.processEvent(event, this.roundAgg.getCurrentRoundNumber());
      this.roundAgg.processEvent(event);
    }
  }

  private handlePlayerState(event: GameEvent): void {
    let steamId64: string | undefined;
    let name: string | undefined;
    let team: Team | undefined;
    let currentClass: string | undefined;

    if (event.type === 'player_connected' || event.type === 'player_role_change' || event.type === 'player_team_change') {
      steamId64 = event.player.steamId.id64;
      name = event.player.name;
      team = event.player.team;
    }

    if (event.type === 'player_role_change') {
      currentClass = event.class;
    }

    if (steamId64) {
      const existing = this.playerState.get(steamId64);
      this.playerState.set(steamId64, {
        name: name || existing?.name || 'Unknown',
        team: team || existing?.team || 'unknown',
        currentClass: currentClass || existing?.currentClass || 'undefined',
      });
    }
  }

  private handleRoundStart(event: Extract<GameEvent, { type: 'round_start' }>): void {
    this.gameActive = true;
    this.roundAgg.startRound(event.timestamp);
  }

  private handleRoundWin(event: Extract<GameEvent, { type: 'round_win' }>): void {
    this.gameActive = false;
    // round_length comes AFTER round_win, so we pass 0 for now
    this.roundAgg.endRound(event.timestamp, event.winner, 0);
  }

  private handleRoundLength(event: Extract<GameEvent, { type: 'round_length' }>): void {
    // round_length comes after round_win, so apply it to the last round
    this.roundAgg.setRoundDuration(event.seconds);
  }

  private handleTeamScore(event: Extract<GameEvent, { type: 'team_score' }>): void {
    if (event.team === 'red' || event.team === 'blue') {
      this.teamStats[event.team].score = event.score;
    }
  }

  private handleChat(event: Extract<GameEvent, { type: 'chat' }>): void {
    this.chat.push({
      steamId64: event.player.steamId.id64,
      timestamp: event.timestamp,
      message: event.message,
    });
  }

  private handleKill(event: Extract<GameEvent, { type: 'kill' }>): void {
    const killerTeam = event.killer.team;
    if (killerTeam === 'red' || killerTeam === 'blue') {
      this.teamStats[killerTeam].kills++;
    }

    // Track kill spread
    const killerId = event.killer.steamId.id64;
    const victimId = event.victim.steamId.id64;

    if (!this.killSpread[killerId]) {
      this.killSpread[killerId] = {};
    }
    this.killSpread[killerId][victimId] = (this.killSpread[killerId][victimId] || 0) + 1;

    // Track kill streaks (simplified - would need more state tracking for accuracy)
    // TODO: Implement proper kill streak tracking
  }

  private handleDamage(event: Extract<GameEvent, { type: 'damage' }>): void {
    const attackerTeam = event.attacker.team;
    // Cap damage at 450 (matches old parser logic)
    const damage = Math.min(event.damage, 450);

    if (attackerTeam === 'red' || attackerTeam === 'blue') {
      this.teamStats[attackerTeam].damage += damage;

      // Track damage per interval (30 second intervals)
      const intervalIndex = Math.floor((event.timestamp - this.startTime) / 30);
      if (!this.damagePerInterval[attackerTeam][intervalIndex]) {
        this.damagePerInterval[attackerTeam][intervalIndex] = 0;
      }
      this.damagePerInterval[attackerTeam][intervalIndex] += damage;
    }
  }

  private handleAssist(event: Extract<GameEvent, { type: 'assist' }>): void {
    const assisterId = event.assister.steamId.id64;
    const victimId = event.victim.steamId.id64;

    if (!this.assistSpread[assisterId]) {
      this.assistSpread[assisterId] = {};
    }
    this.assistSpread[assisterId][victimId] = (this.assistSpread[assisterId][victimId] || 0) + 1;
  }

  private handleHeal(event: Extract<GameEvent, { type: 'heal' }>): void {
    const healerTeam = event.healer.team;
    const healerId = event.healer.steamId.id64;
    const targetId = event.target.steamId.id64;

    if (healerTeam === 'red' || healerTeam === 'blue') {
      this.teamStats[healerTeam].heals += event.healing;

      // Track heals per interval
      const intervalIndex = Math.floor((event.timestamp - this.startTime) / 30);
      if (!this.healsPerInterval[healerTeam][intervalIndex]) {
        this.healsPerInterval[healerTeam][intervalIndex] = 0;
      }
      this.healsPerInterval[healerTeam][intervalIndex] += event.healing;
    }

    // Track heal spread
    if (!this.healSpread[healerId]) {
      this.healSpread[healerId] = {};
    }
    this.healSpread[healerId][targetId] = (this.healSpread[healerId][targetId] || 0) + event.healing;
  }

  private handleChargeDeployed(event: Extract<GameEvent, { type: 'charge_deployed' }>): void {
    const medicTeam = event.medic.team;
    if (medicTeam === 'red' || medicTeam === 'blue') {
      this.teamStats[medicTeam].charges++;
    }
  }

  private handleMedicDeath(event: Extract<GameEvent, { type: 'medic_death' }>): void {
    if (event.uberCharge) {
      const killerTeam = event.killer.team;
      if (killerTeam === 'red' || killerTeam === 'blue') {
        this.teamStats[killerTeam].drops++;
      }
    }
  }

  private handlePointCaptured(event: Extract<GameEvent, { type: 'point_captured' }>): void {
    if (event.team === 'red' || event.team === 'blue') {
      this.teamStats[event.team].caps++;

      // Check if this is a first cap
      const currentRound = this.roundAgg.getCurrentRound();
      if (currentRound && currentRound.firstCap === event.team) {
        this.teamStats[event.team].firstcaps++;
      }
    }
  }

  /**
   * Finalize and build the complete match data
   */
  finalize(allEvents: GameEvent[], parseTime: number, linesProcessed: number): ParsedMatch {
    // Calculate match length as sum of round durations (matches logs.tf approach)
    const rounds = this.roundAgg.getRounds();
    const matchLength = rounds.reduce((sum, round) => sum + round.roundDuration, 0);

    // Finalize player stats
    this.playerAgg.finalizeStats(matchLength);

    // Apply player state to player stats
    const players = this.playerAgg.getPlayers();
    for (const [steamId64, playerStats] of Object.entries(players)) {
      const state = this.playerState.get(steamId64);
      if (state) {
        playerStats.userName = state.name;
        playerStats.team = state.team;
        playerStats.steamId.id3 = '[U:1:' + (BigInt(steamId64) - 76561197960265728n).toString() + ']';
        // Set primary class (most played)
        let maxTime = 0;
        let primaryClass: any = 'undefined';
        for (const [className, classStats] of Object.entries(playerStats.classStats)) {
          if (classStats.playtime > maxTime) {
            maxTime = classStats.playtime;
            primaryClass = className;
          }
        }
        playerStats.primaryClass = primaryClass;
      }
    }

    // Recalculate team kills based on player's FINAL team (matches logs.tf approach)
    // logs.tf assigns kills to teams based on player's final team, not their team during each kill
    this.teamStats.red.kills = 0;
    this.teamStats.blue.kills = 0;
    for (const [steamId64, playerStats] of Object.entries(players)) {
      if (playerStats.team === 'red') {
        this.teamStats.red.kills += playerStats.kills;
      } else if (playerStats.team === 'blue') {
        this.teamStats.blue.kills += playerStats.kills;
      }
    }

    // Calculate final team scores from rounds
    if (rounds.length > 0) {
      // Count round wins for final score
      let redWins = 0;
      let blueWins = 0;
      for (const round of rounds) {
        if (round.winner === 'red') redWins++;
        if (round.winner === 'blue') blueWins++;
      }
      this.teamStats.red.score = redWins;
      this.teamStats.blue.score = blueWins;
    }

    // Determine winner
    const winner: Team =
      this.teamStats.red.score > this.teamStats.blue.score
        ? 'red'
        : this.teamStats.blue.score > this.teamStats.red.score
          ? 'blue'
          : 'unknown';

    const matchInfo: MatchInfo = {
      logId: this.logId,
      map: this.map,
      title: this.title,
      date: this.startTime,
      matchLength,
      winner,
      status: 'completed',
      pauseData: this.pauseData,
    };

    return {
      info: matchInfo,
      teams: this.teamStats,
      players,
      rounds,
      events: allEvents,
      chat: this.chat,
      healSpread: this.healSpread,
      killSpread: this.killSpread,
      assistSpread: this.assistSpread,
      damagePerInterval: this.damagePerInterval,
      healsPerInterval: this.healsPerInterval,
      killStreaks: this.killStreaks,
      parserMetadata: {
        version: '2.0.0',
        parseTime,
        linesProcessed,
        errors: [],
        warnings: [],
      },
    };
  }
}

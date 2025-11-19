/**
 * Round aggregator - Tracks round-level statistics
 */

import { GameEvent, Team } from '../types/events';
import { Round, CaptureEvent } from '../types/match';

export class RoundAggregator {
  private rounds: Round[] = [];
  private currentRound: Round | null = null;
  private roundNumber: number = 0;
  private firstRoundWinSeen: boolean = false;

  constructor() {
    // Create Round 1 immediately to capture pre-first-round-win events
    this.roundNumber = 1;
    this.currentRound = {
      roundNumber: 1,
      roundBegin: 0,
      roundEnd: 0,
      roundDuration: 0,
      winner: 'unknown',
      firstCap: null,
      overtime: false,
      teamScores: {
        red: { score: 0, kills: 0, damage: 0, ubers: 0 },
        blue: { score: 0, kills: 0, damage: 0, ubers: 0 },
      },
      captureEvents: [],
      events: [],
      playerPerformance: {},
    };
    this.rounds.push(this.currentRound);
  }

  /**
   * Start a new round
   * Only creates a round after the first round_win has been seen (ignores warmup)
   * Only creates a new round if the previous round has been completed
   */
  startRound(timestamp: number): void {
    // Don't create rounds until we've seen the first round_win
    // This filters out warmup/duplicate round_start events
    if (!this.firstRoundWinSeen) {
      return;
    }

    // Don't create a new round if the current round hasn't been completed yet
    // This handles cases where Round_Start is called multiple times before Round_Win
    if (this.currentRound && this.currentRound.winner === 'unknown') {
      // Round is still live, don't create a new one
      return;
    }

    this.roundNumber++;

    this.currentRound = {
      roundNumber: this.roundNumber,
      roundBegin: timestamp,
      roundEnd: timestamp,
      roundDuration: 0,
      winner: 'unknown',
      firstCap: null,
      overtime: false,
      teamScores: {
        red: { score: 0, kills: 0, damage: 0, ubers: 0 },
        blue: { score: 0, kills: 0, damage: 0, ubers: 0 },
      },
      captureEvents: [],
      events: [],
      playerPerformance: {},
    };

    this.rounds.push(this.currentRound);
  }

  /**
   * End the current round
   */
  endRound(timestamp: number, winner: Team, roundLength?: number): void {
    if (!this.currentRound) return;

    // Mark that we've seen the first round_win
    if (!this.firstRoundWinSeen) {
      this.firstRoundWinSeen = true;
    }

    this.currentRound.roundEnd = timestamp;
    this.currentRound.roundDuration = roundLength || (timestamp - this.currentRound.roundBegin);
    this.currentRound.winner = winner;
  }

  /**
   * Set round overtime
   */
  setOvertime(): void {
    if (this.currentRound) {
      this.currentRound.overtime = true;
    }
  }

  /**
   * Set the duration for the last completed round
   * Called when round_length event occurs (which comes after round_win)
   */
  setRoundDuration(seconds: number): void {
    if (this.rounds.length > 0) {
      const lastRound = this.rounds[this.rounds.length - 1];
      lastRound.roundDuration = seconds;
    }
  }

  /**
   * Process an event for the current round
   */
  processEvent(event: GameEvent): void {
    if (!this.currentRound) return;

    // Add event to round
    this.currentRound.events.push(event);

    switch (event.type) {
      case 'kill':
        this.handleKill(event);
        break;

      case 'damage':
        this.handleDamage(event);
        break;

      case 'charge_deployed':
        this.handleChargeDeployed(event);
        break;

      case 'point_captured':
        this.handlePointCaptured(event);
        break;

      case 'team_score':
        this.handleTeamScore(event);
        break;
    }
  }

  private handleKill(event: Extract<GameEvent, { type: 'kill' }>): void {
    if (!this.currentRound) return;

    const killerTeam = event.killer.team;
    if (killerTeam === 'red' || killerTeam === 'blue') {
      this.currentRound.teamScores[killerTeam].kills++;
    }

    // Track per-player performance
    const killerId = event.killer.steamId.id64;
    const victimId = event.victim.steamId.id64;

    if (!this.currentRound.playerPerformance[killerId]) {
      this.currentRound.playerPerformance[killerId] = {
        kills: 0,
        deaths: 0,
        damage: 0,
        heals: 0,
      };
    }
    if (!this.currentRound.playerPerformance[victimId]) {
      this.currentRound.playerPerformance[victimId] = {
        kills: 0,
        deaths: 0,
        damage: 0,
        heals: 0,
      };
    }

    this.currentRound.playerPerformance[killerId].kills++;
    this.currentRound.playerPerformance[victimId].deaths++;
  }

  private handleDamage(event: Extract<GameEvent, { type: 'damage' }>): void {
    if (!this.currentRound) return;

    // Cap damage at 450 (matches old parser logic)
    const damage = Math.min(event.damage, 450);

    const attackerTeam = event.attacker.team;
    if (attackerTeam === 'red' || attackerTeam === 'blue') {
      this.currentRound.teamScores[attackerTeam].damage += damage;
    }

    // Track per-player performance
    const attackerId = event.attacker.steamId.id64;
    if (!this.currentRound.playerPerformance[attackerId]) {
      this.currentRound.playerPerformance[attackerId] = {
        kills: 0,
        deaths: 0,
        damage: 0,
        heals: 0,
      };
    }
    this.currentRound.playerPerformance[attackerId].damage += damage;
  }

  private handleChargeDeployed(event: Extract<GameEvent, { type: 'charge_deployed' }>): void {
    if (!this.currentRound) return;

    const medicTeam = event.medic.team;
    if (medicTeam === 'red' || medicTeam === 'blue') {
      this.currentRound.teamScores[medicTeam].ubers++;
    }
  }

  private handlePointCaptured(event: Extract<GameEvent, { type: 'point_captured' }>): void {
    if (!this.currentRound) return;

    // Record first cap
    if (this.currentRound.firstCap === null) {
      this.currentRound.firstCap = event.team;
    }

    // Add capture event
    const captureEvent: CaptureEvent = {
      team: event.team,
      time: event.timestamp - this.currentRound.roundBegin,
      name: event.cpName,
    };
    this.currentRound.captureEvents.push(captureEvent);
  }

  private handleTeamScore(event: Extract<GameEvent, { type: 'team_score' }>): void {
    if (!this.currentRound) return;

    if (event.team === 'red' || event.team === 'blue') {
      this.currentRound.teamScores[event.team].score = event.score;
    }
  }

  /**
   * Get current round number
   */
  getCurrentRoundNumber(): number {
    return this.roundNumber;
  }

  /**
   * Get all rounds
   */
  getRounds(): Round[] {
    return this.rounds;
  }

  /**
   * Get current round
   */
  getCurrentRound(): Round | null {
    return this.currentRound;
  }
}

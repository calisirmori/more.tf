/**
 * Other Data Aggregator
 * Handles non-time-sensitive data like chat, player info, rounds
 */

import {
  GameEvent,
  PlayerConnectedEvent,
  PlayerDisconnectedEvent,
  ChatMessageEvent,
  RoundStartEvent,
  RoundWinEvent,
  Team,
  TF2Class,
  PlayerSpawnEvent,
} from '../types/events';
import { PlayerDetails, RoundDetails, ChatMessage, OtherData } from '../types/output';
import { steamId3ToId64 } from '../tokenizer/patterns';

export class OtherDataAggregator {
  private players: Map<string, PlayerDetails> = new Map();
  private rounds: RoundDetails[] = [];
  private chat: ChatMessage[] = [];
  private currentRound: RoundDetails | null = null;
  private roundNumber = 0;

  /**
   * Process a single event
   */
  processEvent(event: GameEvent): void {
    switch (event.type) {
      case 'player_connected':
        this.processPlayerConnected(event);
        break;
      case 'player_disconnected':
        this.processPlayerDisconnected(event);
        break;
      case 'player_spawn':
        this.processPlayerSpawn(event);
        break;
      case 'chat':
        this.processChatMessage(event);
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
    const steamId = event.player.steamId.id3;

    if (!this.players.has(steamId)) {
      this.players.set(steamId, {
        steamId,
        steamId64: steamId3ToId64(steamId),
        name: event.player.name,
        team: event.player.team,
        classesPlayed: [],
        primaryClass: 'undefined',
        connected: event.timestamp,
      });
    }
  }

  private processPlayerDisconnected(event: PlayerDisconnectedEvent): void {
    const steamId = event.player.steamId.id3;
    const player = this.players.get(steamId);

    if (player) {
      player.disconnected = event.timestamp;
    }
  }

  private processPlayerSpawn(event: PlayerSpawnEvent): void {
    const steamId = event.player.steamId.id3;

    // Ensure player exists
    if (!this.players.has(steamId)) {
      this.players.set(steamId, {
        steamId,
        steamId64: steamId3ToId64(steamId),
        name: event.player.name,
        team: event.player.team,
        classesPlayed: [],
        primaryClass: 'undefined',
        connected: event.timestamp,
      });
    }

    const player = this.players.get(steamId)!;

    // Update team
    player.team = event.player.team;

    // Track classes played
    if (!player.classesPlayed.includes(event.class)) {
      player.classesPlayed.push(event.class);
    }

    // Set primary class (first class played)
    if (player.primaryClass === 'undefined') {
      player.primaryClass = event.class;
    }
  }

  private processChatMessage(event: ChatMessageEvent): void {
    this.chat.push({
      timestamp: event.timestamp,
      steamId: event.player.steamId.id3,
      playerName: event.player.name,
      team: event.player.team,
      message: event.message,
      isTeamChat: event.isTeamChat,
    });
  }

  private processRoundStart(event: RoundStartEvent): void {
    // Finalize previous round if exists
    if (this.currentRound) {
      this.currentRound.endTime = event.timestamp;
      this.currentRound.duration = this.currentRound.endTime - this.currentRound.startTime;
      this.rounds.push(this.currentRound);
    }

    // Start new round
    this.roundNumber++;
    this.currentRound = {
      roundNumber: this.roundNumber,
      startTime: event.timestamp,
      score: {
        red: 0,
        blue: 0,
      },
    };
  }

  private processRoundWin(event: RoundWinEvent): void {
    if (this.currentRound) {
      this.currentRound.winner = event.winner;
      this.currentRound.endTime = event.timestamp;
      this.currentRound.duration = this.currentRound.endTime - this.currentRound.startTime;
    }
  }

  private processTeamScore(event: GameEvent): void {
    if (event.type !== 'team_score') return;

    if (this.currentRound) {
      if (event.team === 'red') {
        this.currentRound.score.red = event.score;
      } else if (event.team === 'blue') {
        this.currentRound.score.blue = event.score;
      }
    }
  }

  /**
   * Finalize and return other data
   */
  finalize(): OtherData {
    // Add final round if it exists
    if (this.currentRound) {
      this.rounds.push(this.currentRound);
    }

    return {
      players: Array.from(this.players.values()),
      rounds: this.rounds,
      chat: this.chat,
      ubers: [], // Populated separately by UberTracker
      killstreaks: [], // Populated separately by KillstreakTracker
      medicStats: [], // Populated separately by MedicStatsAggregator
    };
  }
}

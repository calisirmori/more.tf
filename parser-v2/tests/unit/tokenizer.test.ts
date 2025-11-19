/**
 * Tokenizer unit tests
 */

import { tokenize, tokenizeLine, validateLogFormat, TokenCategory } from '../../src/tokenizer';
import { extractTimestamp, extractPlayers, steamId3ToId64 } from '../../src/tokenizer/patterns';

describe('Tokenizer', () => {
  describe('extractTimestamp', () => {
    it('should extract timestamp from valid log line', () => {
      const line = 'L 11/11/2025 - 21:53:26: "player<75><[U:1:123]><Red>" changed role to "scout"';
      const timestamp = extractTimestamp(line);
      expect(timestamp).not.toBeNull();
      expect(typeof timestamp).toBe('number');
    });

    it('should return null for invalid timestamp', () => {
      const line = 'Invalid log line without timestamp';
      const timestamp = extractTimestamp(line);
      expect(timestamp).toBeNull();
    });
  });

  describe('extractPlayers', () => {
    it('should extract single player', () => {
      const line = 'L 11/11/2025 - 21:53:26: "mori<70><[U:1:108135668]><Blue>" changed role to "demoman"';
      const players = extractPlayers(line);

      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('mori');
      expect(players[0].userId).toBe('70');
      expect(players[0].steamId3).toBe('[U:1:108135668]');
      expect(players[0].team).toBe('Blue');
    });

    it('should extract multiple players from kill event', () => {
      const line = 'L 11/11/2025 - 21:53:29: "Poseidon<68><[U:1:133718175]><Red>" killed "bobby butwhole<86><[U:1:103185154]><Blue>" with "quake_rl"';
      const players = extractPlayers(line);

      expect(players).toHaveLength(2);
      expect(players[0].name).toBe('Poseidon');
      expect(players[1].name).toBe('bobby butwhole');
    });

    it('should handle names with special characters', () => {
      const line = 'L 11/11/2025 - 21:53:26: "bgabagbagabagabagbagb<72><[U:1:134247264]><Red>" changed role to "sniper"';
      const players = extractPlayers(line);

      expect(players).toHaveLength(1);
      expect(players[0].name).toBe('bgabagbagabagabagbagb');
    });
  });

  describe('steamId3ToId64', () => {
    it('should convert Steam ID3 to ID64', () => {
      const id3 = '[U:1:108135668]';
      const id64 = steamId3ToId64(id3);

      expect(id64).toBe('76561198068401396');
    });

    it('should handle different Steam IDs', () => {
      const id3 = '[U:1:123456789]';
      const id64 = steamId3ToId64(id3);

      expect(id64).toBe('76561198083722517');
    });
  });

  describe('tokenizeLine', () => {
    it('should tokenize role change event', () => {
      const line = 'L 11/11/2025 - 21:53:26: "mori<70><[U:1:108135668]><Blue>" changed role to "demoman"';
      const token = tokenizeLine(line, 1);

      expect(token.lineNumber).toBe(1);
      expect(token.timestamp).not.toBeNull();
      expect(token.category).toBe(TokenCategory.PLAYER_STATE);
      expect(token.players).toHaveLength(1);
      expect(token.rawLine).toBe(line);
    });

    it('should tokenize damage event', () => {
      const line = 'L 11/11/2025 - 21:53:27: "bobby butwhole<86><[U:1:103185154]><Blue>" triggered "damage" against "bgabagbagabagabagbagb<72><[U:1:134247264]><Red>" (damage "16") (weapon "tomislav")';
      const token = tokenizeLine(line, 2);

      expect(token.category).toBe(TokenCategory.COMBAT);
      expect(token.players).toHaveLength(2);
    });

    it('should tokenize world event', () => {
      const line = 'L 11/11/2025 - 21:53:31: World triggered "Round_Start"';
      const token = tokenizeLine(line, 3);

      expect(token.category).toBe(TokenCategory.WORLD_EVENT);
      expect(token.players).toHaveLength(0);
    });

    it('should tokenize heal event', () => {
      const line = 'L 11/11/2025 - 21:53:27: "flu<74><[U:1:247674408]><Blue>" triggered "healed" against "fume.<83><[U:1:211073]><Blue>" (healing "30")';
      const token = tokenizeLine(line, 4);

      expect(token.category).toBe(TokenCategory.MEDIC);
      expect(token.players).toHaveLength(2);
    });
  });

  describe('validateLogFormat', () => {
    it('should validate correct log format', () => {
      const validLog = 'L 11/11/2025 - 21:53:26: "player<75><[U:1:123]><Red>" changed role to "scout"';
      const result = validateLogFormat(validLog);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty log', () => {
      const emptyLog = '';
      const result = validateLogFormat(emptyLog);

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject invalid log format', () => {
      const invalidLog = 'This is not a valid TF2 log';
      const result = validateLogFormat(invalidLog);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid log format');
    });
  });

  describe('tokenize', () => {
    it('should tokenize multiple lines', () => {
      const log = `L 11/11/2025 - 21:53:26: "player1<75><[U:1:123]><Red>" changed role to "scout"
L 11/11/2025 - 21:53:27: "player2<76><[U:1:456]><Blue>" changed role to "medic"
L 11/11/2025 - 21:53:31: World triggered "Round_Start"`;

      const tokens = tokenize(log);

      expect(tokens).toHaveLength(3);
      expect(tokens[0].category).toBe(TokenCategory.PLAYER_STATE);
      expect(tokens[1].category).toBe(TokenCategory.PLAYER_STATE);
      expect(tokens[2].category).toBe(TokenCategory.WORLD_EVENT);
    });

    it('should skip empty lines', () => {
      const log = `L 11/11/2025 - 21:53:26: "player<75><[U:1:123]><Red>" changed role to "scout"

L 11/11/2025 - 21:53:27: World triggered "Round_Start"`;

      const tokens = tokenize(log);

      expect(tokens).toHaveLength(2);
    });

    it('should skip invalid lines', () => {
      const log = `L 11/11/2025 - 21:53:26: "player<75><[U:1:123]><Red>" changed role to "scout"
Some random text
L 11/11/2025 - 21:53:27: World triggered "Round_Start"`;

      const tokens = tokenize(log);

      expect(tokens).toHaveLength(2);
    });
  });
});

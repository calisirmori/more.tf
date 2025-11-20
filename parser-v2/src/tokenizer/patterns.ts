/**
 * Regex patterns for parsing TF2 log lines
 */

// ============= Core Patterns =============

// Timestamp: L 11/11/2025 - 21:53:26:
export const TIMESTAMP_PATTERN =
  /^L (\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2}):(\d{2}):/;

// Player identifier: "PlayerName<75><[U:1:123456789]><Team>" or "BotName<75><BOT><Team>"
// Note: Player names can contain < and > characters, so we use non-greedy match
export const PLAYER_PATTERN =
  /"(.+?)<(\d+)><(BOT|\[U:1:\d+\])><(Red|Blue|Spectator|unknown)>"/g;

// Position: (attacker_position "x y z")
export const POSITION_PATTERN = /\((?:attacker|victim|assister)_position "([^"]+)"\)/g;

// ============= Event Type Patterns =============

// World events
export const WORLD_TRIGGER_PATTERN = /World triggered "([^"]+)"/;
export const ROUND_WIN_PATTERN = /World triggered "Round_Win" \(winner "([^"]+)"\)/;
export const ROUND_LENGTH_PATTERN = /World triggered "Round_Length" \(seconds "([^"]+)"\)/;
export const GAME_OVER_PATTERN = /World triggered "Game_Over" reason "([^"]+)"/;

// Team score
export const TEAM_SCORE_PATTERN =
  /Team "([^"]+)" (current|final) score "(\d+)" with "(\d+)" players/;

// Player events
export const ROLE_CHANGE_PATTERN = /changed role to "([^"]+)"/;
export const TEAM_CHANGE_PATTERN = /joined team "([^"]+)"/;
export const SPAWNED_PATTERN = /spawned as "([^"]+)"/;
export const CONNECTED_PATTERN = /connected, address/;
export const DISCONNECTED_PATTERN = /disconnected/;
export const ENTERED_PATTERN = /entered the game/;

// Combat events
// Note: Player names can contain < and > characters, so we use non-greedy match
export const KILL_PATTERN =
  /"(.+?)<(\d+)><(BOT|\[U:1:\d+\])><([^"]+)>" killed "(.+?)<(\d+)><(BOT|\[U:1:\d+\])><([^"]+)>" with "([^"]+)"/;

export const DAMAGE_PATTERN = /triggered "damage"/;
export const SUICIDE_PATTERN = /committed suicide with "([^"]+)"/;

// Triggered events
export const TRIGGERED_PATTERN = /triggered "([^"]+)"/;

// Specific triggered events
export const SHOT_FIRED_PATTERN = /triggered "shot_fired" \(weapon "([^"]+)"\)/;
export const SHOT_HIT_PATTERN = /triggered "shot_hit" \(weapon "([^"]+)"\)/;
export const HEAL_PATTERN = /triggered "healed" against .+ \(healing "(\d+)"\)/;
export const ASSIST_PATTERN = /triggered "kill assist"/;
export const DOMINATION_PATTERN = /triggered "domination"/;
export const REVENGE_PATTERN = /triggered "revenge"/;
export const BUILDING_BUILT_PATTERN = /triggered "player_builtobject"/;
export const BUILDING_KILLED_PATTERN = /triggered "killedobject"/;
export const EXTINGUISH_PATTERN = /triggered "player_extinguished"/;
export const CAPTURE_BLOCKED_PATTERN = /triggered "captureblocked"/;

// Medic events
export const CHARGE_DEPLOYED_PATTERN = /triggered "chargedeployed" \(medigun "([^"]+)"\)/;
export const CHARGE_ENDED_PATTERN = /triggered "chargeended" \(duration "([^"]+)"\)/;
export const CHARGE_READY_PATTERN = /triggered "chargeready"/;
export const MEDIC_DEATH_PATTERN = /triggered "medic_death"/;
export const FIRST_HEAL_PATTERN = /triggered "first_heal_after_spawn" \(time "([^"]+)"\)/;

// Point capture
export const POINT_CAPTURED_PATTERN =
  /Team "([^"]+)" triggered "pointcaptured" \(cp "([^"]+)"\) \(cpname "([^"]+)"\)/;

// Item pickup
export const ITEM_PICKUP_PATTERN = /picked up item "([^"]+)"/;

// Chat (both all chat and team chat)
export const CHAT_PATTERN = /say(?:_team)? "([^"]+)"/;

// Pause
export const PAUSE_PATTERN = /pause/;
export const UNPAUSE_PATTERN = /unpause/;

// ============= Value Extraction Patterns =============

export const DAMAGE_VALUE_PATTERN = /\(damage "(\d+)"\)/;
export const REAL_DAMAGE_PATTERN = /\(realdamage "(\d+)"\)/;
export const HEALING_VALUE_PATTERN = /\(healing "(\d+)"\)/;
export const WEAPON_PATTERN = /\(weapon "([^"]+)"\)/;
export const CRIT_PATTERN = /\(crit "crit"\)/;
export const HEADSHOT_PATTERN = /\(headshot "1"\)/;
export const AIRSHOT_PATTERN = /\(airshot "1"\)/;
export const CUSTOM_KILL_PATTERN = /\(customkill "([^"]+)"\)/;
export const UBER_PCT_PATTERN = /\(uberpct "(\d+)"\)/;
export const OBJECT_TYPE_PATTERN = /\(object "([^"]+)"\)/;
export const OBJECT_OWNER_PATTERN = /\(objectowner "([^"<>]+)<(\d+)><(\[U:1:\d+\])><([^"]+)>"\)/;

// ============= Helper Functions =============

/**
 * Extract timestamp from log line
 * Returns Unix timestamp in milliseconds
 */
export function extractTimestamp(line: string): number | null {
  const match = line.match(TIMESTAMP_PATTERN);
  if (!match) return null;

  const [, month, day, year, hour, minute, second] = match;
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);

  return date.getTime() / 1000; // Convert to seconds
}

/**
 * Extract all player identifiers from a line
 * Returns array of player data
 */
export function extractPlayers(line: string): Array<{
  name: string;
  userId: string;
  steamId3: string;
  team: string;
}> {
  const players: Array<{
    name: string;
    userId: string;
    steamId3: string;
    team: string;
  }> = [];

  // Reset regex lastIndex
  PLAYER_PATTERN.lastIndex = 0;

  let match;
  while ((match = PLAYER_PATTERN.exec(line)) !== null) {
    players.push({
      name: match[1],
      userId: match[2],
      steamId3: match[3],
      team: match[4],
    });
  }

  return players;
}

/**
 * Extract position coordinates
 */
export function extractPositions(line: string): Array<{ x: number; y: number; z: number }> {
  const positions: Array<{ x: number; y: number; z: number }> = [];

  // Reset regex lastIndex
  POSITION_PATTERN.lastIndex = 0;

  let match;
  while ((match = POSITION_PATTERN.exec(line)) !== null) {
    const [x, y, z] = match[1].split(' ').map(Number);
    positions.push({ x, y, z });
  }

  return positions;
}

/**
 * Extract numeric value from pattern
 */
export function extractValue(line: string, pattern: RegExp): number | null {
  const match = line.match(pattern);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Extract string value from pattern
 */
export function extractString(line: string, pattern: RegExp): string | null {
  const match = line.match(pattern);
  return match ? match[1] : null;
}

/**
 * Check if line contains pattern
 */
export function hasPattern(line: string, pattern: RegExp): boolean {
  return pattern.test(line);
}

/**
 * Convert Steam ID3 to ID64
 */
export function steamId3ToId64(id3: string): string {
  // Handle BOT players
  if (id3 === 'BOT') {
    return 'BOT';
  }

  const cleanId3 = id3.replace(/\[U:1:(\d+)\]/, '$1');
  const accountId = parseInt(cleanId3);
  const steamId64Base = 76561197960265728n;
  const steamId64 = steamId64Base + BigInt(accountId);
  return steamId64.toString();
}

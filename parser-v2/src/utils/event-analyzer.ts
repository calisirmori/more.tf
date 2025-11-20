/**
 * Event Analyzer - Tool to detect all possible event types in TF2 logs
 * This helps ensure we're parsing every single event type
 */

export interface EventPattern {
  pattern: string;
  regex?: RegExp;
  category: string;
  description: string;
  examples: string[];
}

/**
 * Comprehensive list of all known TF2 log event patterns
 */
export const ALL_EVENT_PATTERNS: EventPattern[] = [
  // ========== WORLD EVENTS ==========
  {
    pattern: 'Round_Start',
    regex: /World triggered "Round_Start"/,
    category: 'world',
    description: 'Round has started',
    examples: ['L 11/11/2025 - 21:53:31: World triggered "Round_Start"'],
  },
  {
    pattern: 'Round_Win',
    regex: /World triggered "Round_Win"/,
    category: 'world',
    description: 'Round won by a team',
    examples: ['L 11/11/2025 - 21:53:31: World triggered "Round_Win" (winner "Red")'],
  },
  {
    pattern: 'Round_Length',
    regex: /World triggered "Round_Length"/,
    category: 'world',
    description: 'Round duration',
    examples: ['L 11/11/2025 - 21:53:31: World triggered "Round_Length" (seconds "120")'],
  },
  {
    pattern: 'Round_Overtime',
    regex: /World triggered "Round_Overtime"/,
    category: 'world',
    description: 'Round went into overtime',
    examples: ['L 11/11/2025 - 21:53:31: World triggered "Round_Overtime"'],
  },
  {
    pattern: 'Game_Over',
    regex: /World triggered "Game_Over"/,
    category: 'world',
    description: 'Match has ended',
    examples: ['L 11/11/2025 - 21:53:31: World triggered "Game_Over" reason "Reached Time Limit"'],
  },
  {
    pattern: 'Team_Score',
    regex: /Team ".+" (current|final) score/,
    category: 'world',
    description: 'Team score update',
    examples: ['L 11/11/2025 - 21:53:31: Team "Red" current score "2" with "6" players'],
  },

  // ========== PLAYER STATE ==========
  {
    pattern: 'connected',
    regex: /connected, address/,
    category: 'player_state',
    description: 'Player connected to server',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><>" connected, address ""'],
  },
  {
    pattern: 'disconnected',
    regex: /disconnected/,
    category: 'player_state',
    description: 'Player disconnected from server',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" disconnected'],
  },
  {
    pattern: 'entered',
    regex: /entered the game/,
    category: 'player_state',
    description: 'Player entered the game',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><>" entered the game'],
  },
  {
    pattern: 'joined_team',
    regex: /joined team/,
    category: 'player_state',
    description: 'Player joined a team',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Unassigned>" joined team "Red"'],
  },
  {
    pattern: 'changed_role',
    regex: /changed role to/,
    category: 'player_state',
    description: 'Player changed class',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" changed role to "soldier"'],
  },
  {
    pattern: 'spawned',
    regex: /spawned as/,
    category: 'player_state',
    description: 'Player spawned',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" spawned as "soldier"'],
  },
  {
    pattern: 'player_loadout',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "player_loadout"/,
    category: 'player_state',
    description: 'Player loadout/cosmetics tracked',
    examples: [
      'L 01/02/2023 - 00:20:17: "Bucuresti1010<22><STEAM_0:0:585502738><Blue>" triggered "player_loadout" (primary "-1") (secondary "-1") (melee "-1") (pda "-1") (pda2 "-1") (building "-1") (head "-1") (misc "-1")',
    ],
  },
  {
    pattern: 'say',
    regex: /say "/,
    category: 'player_state',
    description: 'Player chat message',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" say "gg"'],
  },
  {
    pattern: 'say_team',
    regex: /say_team "/,
    category: 'player_state',
    description: 'Player team chat message',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" say_team "push now"'],
  },

  // ========== COMBAT EVENTS ==========
  {
    pattern: 'killed',
    regex: /killed ".+" with/,
    category: 'combat',
    description: 'Player killed another player',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player1<1><[U:1:123]><Red>" killed "Player2<2><[U:1:456]><Blue>" with "shotgun_primary"',
    ],
  },
  {
    pattern: 'damage',
    regex: /triggered "damage"/,
    category: 'combat',
    description: 'Player dealt damage',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player1<1><[U:1:123]><Red>" triggered "damage" against "Player2<2><[U:1:456]><Blue>" (damage "50")',
    ],
  },
  {
    pattern: 'suicide',
    regex: /committed suicide with/,
    category: 'combat',
    description: 'Player committed suicide',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" committed suicide with "world"'],
  },
  {
    pattern: 'force_suicide',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "force_suicide"/,
    category: 'combat',
    description: 'Player forced to suicide (console command)',
    examples: [
      'L 01/02/2023 - 00:23:26: "Mr.Zergling<25><STEAM_0:0:79825490><Red>" triggered "force_suicide"',
    ],
  },
  {
    pattern: 'kill_assist',
    regex: /triggered "kill assist"/,
    category: 'combat',
    description: 'Player assisted in a kill',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" triggered "kill assist" against "Player2<2><[U:1:456]><Blue>"',
    ],
  },
  {
    pattern: 'shot_fired',
    regex: /triggered "shot_fired"/,
    category: 'combat',
    description: 'Player fired a shot (snipers, etc)',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" triggered "shot_fired" (weapon "sniperrifle")',
    ],
  },
  {
    pattern: 'shot_hit',
    regex: /triggered "shot_hit"/,
    category: 'combat',
    description: 'Player hit a shot (snipers, etc)',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" triggered "shot_hit" (weapon "sniperrifle")',
    ],
  },
  {
    pattern: 'domination',
    regex: /triggered "domination"/,
    category: 'combat',
    description: 'Player dominated another player',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player1<1><[U:1:123]><Red>" triggered "domination" against "Player2<2><[U:1:456]><Blue>"',
    ],
  },
  {
    pattern: 'revenge',
    regex: /triggered "revenge"/,
    category: 'combat',
    description: 'Player got revenge on dominator',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player1<1><[U:1:123]><Red>" triggered "revenge" against "Player2<2><[U:1:456]><Blue>"',
    ],
  },

  // ========== MEDIC EVENTS ==========
  {
    pattern: 'healed',
    regex: /triggered "healed"/,
    category: 'medic',
    description: 'Medic healed a player',
    examples: [
      'L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "healed" against "Soldier<2><[U:1:456]><Red>" (healing "50")',
    ],
  },
  {
    pattern: 'chargedeployed',
    regex: /triggered "chargedeployed"/,
    category: 'medic',
    description: 'Medic deployed uber',
    examples: [
      'L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "chargedeployed" (medigun "medigun")',
    ],
  },
  {
    pattern: 'chargeended',
    regex: /triggered "chargeended"/,
    category: 'medic',
    description: 'Uber ended',
    examples: [
      'L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "chargeended" (duration "8.5")',
    ],
  },
  {
    pattern: 'buff_deployed',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "buff_deployed"/,
    category: 'medic',
    description: 'Soldier banner buff deployed',
    examples: [
      'L 12/03/2022 - 01:37:00: "‽<11><STEAM_0:0:65926940><Blue>" triggered "buff_deployed"',
    ],
  },
  {
    pattern: 'chargeready',
    regex: /triggered "chargeready"/,
    category: 'medic',
    description: 'Uber charge ready',
    examples: ['L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "chargeready"'],
  },
  {
    pattern: 'medic_death',
    regex: /triggered "medic_death"/,
    category: 'medic',
    description: 'Medic died with uber',
    examples: [
      'L 11/11/2025 - 21:53:31: "Scout<1><[U:1:123]><Blue>" triggered "medic_death" against "Medic<2><[U:1:456]><Red>" (ubercharge "1")',
    ],
  },
  {
    pattern: 'first_heal_after_spawn',
    regex: /triggered "first_heal_after_spawn"/,
    category: 'medic',
    description: 'Medic first heal after spawning',
    examples: [
      'L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "first_heal_after_spawn" (time "5.2")',
    ],
  },
  {
    pattern: 'empty_uber',
    regex: /triggered "empty_uber"/,
    category: 'medic',
    description: 'Round started with empty uber',
    examples: ['L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "empty_uber"'],
  },
  {
    pattern: 'lost_uber_advantage',
    regex: /triggered "lost_uber_advantage"/,
    category: 'medic',
    description: 'Team lost uber advantage',
    examples: [
      'L 11/11/2025 - 21:53:31: "Medic<1><[U:1:123]><Red>" triggered "lost_uber_advantage" (time "12.5")',
    ],
  },

  // ========== OBJECTIVE EVENTS ==========
  {
    pattern: 'pointcaptured',
    regex: /triggered "pointcaptured"/,
    category: 'objective',
    description: 'Control point captured',
    examples: [
      'L 11/11/2025 - 21:53:31: Team "Red" triggered "pointcaptured" (cp "2") (cpname "Middle Point")',
    ],
  },
  {
    pattern: 'captureblocked',
    regex: /triggered "captureblocked"/,
    category: 'objective',
    description: 'Point capture blocked',
    examples: [
      'L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" triggered "captureblocked" (cp "2") (cpname "Middle Point")',
    ],
  },
  {
    pattern: 'player_builtobject',
    regex: /triggered "player_builtobject"/,
    category: 'objective',
    description: 'Engineer built a building',
    examples: [
      'L 11/11/2025 - 21:53:31: "Engineer<1><[U:1:123]><Red>" triggered "player_builtobject" (object "OBJ_SENTRYGUN")',
    ],
  },
  {
    pattern: 'builtobject',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "builtobject"/,
    category: 'objective',
    description: 'Engineer built object (alternative format)',
    examples: [
      'L 01/02/2023 - 00:38:43: "Mr.Zergling<25><STEAM_0:0:79825490><Blue>" triggered "builtobject" (object "OBJ_SENTRYGUN_MINI") (position "-264 -691 -64")',
    ],
  },
  {
    pattern: 'killedobject',
    regex: /triggered "killedobject"/,
    category: 'objective',
    description: 'Building destroyed',
    examples: [
      'L 11/11/2025 - 21:53:31: "Soldier<1><[U:1:123]><Blue>" triggered "killedobject" (object "OBJ_SENTRYGUN") (weapon "tf_projectile_rocket")',
    ],
  },
  {
    pattern: 'object_destroyed',
    regex: /triggered "object_destroyed"/,
    category: 'objective',
    description: 'Building destroyed (alternative format)',
    examples: [
      'L 11/11/2025 - 21:53:31: "Engineer<1><[U:1:123]><Red>" triggered "object_destroyed" (object "OBJ_SENTRYGUN")',
    ],
  },

  // ========== MISC EVENTS ==========
  {
    pattern: 'picked_up_item',
    regex: /picked up item/,
    category: 'misc',
    description: 'Player picked up item',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" picked up item "healthkit_medium"'],
  },
  {
    pattern: 'teleport_self',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "teleport_self"/,
    category: 'misc',
    description: 'Engineer teleported using own teleporter',
    examples: [
      'L 01/02/2023 - 00:33:42: "TheReaPenisMonkey<21><STEAM_0:1:607411259><Red>" triggered "teleport_self"',
    ],
  },
  {
    pattern: 'teleport_self_again',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "teleport_self_again"/,
    category: 'misc',
    description: 'Engineer teleported using own teleporter again',
    examples: [
      'L 01/02/2023 - 00:33:48: "TheReaPenisMonkey<21><STEAM_0:1:607411259><Red>" triggered "teleport_self_again"',
    ],
  },
  {
    pattern: 'teleport_used',
    regex: /triggered "teleport_used"/,
    category: 'misc',
    description: 'Player used teleporter',
    examples: [
      'L 01/02/2023 - 00:34:00: "Player<5><STEAM_0:1:123456789><Red>" triggered "teleport_used"',
    ],
  },
  {
    pattern: 'teleport',
    regex: /triggered "teleport"/,
    category: 'misc',
    description: 'Player teleported',
    examples: [
      'L 01/02/2023 - 00:34:00: "Player<5><STEAM_0:1:123456789><Red>" triggered "teleport"',
    ],
  },
  {
    pattern: 'used_command',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" used "\+/,
    category: 'misc',
    description: 'Player used console command (debug)',
    examples: [
      'L 08/24/2025 - 23:51:04: "GuyGuyGuyGuy420<24><[U:1:1481787693><Red>" used "+right" as "demoman" (position "1 2 3")',
    ],
  },
  {
    pattern: 'player_extinguished',
    regex: /triggered "player_extinguished"/,
    category: 'misc',
    description: 'Player extinguished burning teammate',
    examples: [
      'L 11/11/2025 - 21:53:31: "Pyro<1><[U:1:123]><Red>" triggered "player_extinguished" against "Soldier<2><[U:1:456]><Red>"',
    ],
  },
  {
    pattern: 'jarate_attack',
    regex: /triggered "jarate_attack"/,
    category: 'misc',
    description: 'Sniper threw jarate',
    examples: [
      'L 11/11/2025 - 21:53:31: "Sniper<1><[U:1:123]><Red>" triggered "jarate_attack" against "Scout<2><[U:1:456]><Blue>"',
    ],
  },
  {
    pattern: 'player_milked',
    regex: /triggered "player_milked"/,
    category: 'misc',
    description: 'Player was hit with mad milk',
    examples: [
      'L 11/11/2025 - 21:53:31: "Scout<1><[U:1:123]><Red>" triggered "player_milked" against "Soldier<2><[U:1:456]><Blue>"',
    ],
  },
  {
    pattern: 'stun',
    regex: /triggered "stun"/,
    category: 'misc',
    description: 'Player stunned (sandman, etc)',
    examples: [
      'L 11/11/2025 - 21:53:31: "Scout<1><[U:1:123]><Red>" triggered "stun" against "Medic<2><[U:1:456]><Blue>"',
    ],
  },
  {
    pattern: 'milk_attack',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "milk_attack" against/,
    category: 'misc',
    description: 'Scout threw mad milk at player',
    examples: [
      'L 02/24/2020 - 15:21:02: "bio<6><[U:1:123845754]><Red>" triggered "milk_attack" against "Fastuler Hika<7><[U:1:307256678]><Blue>" with "tf_weapon_jar" (attacker_position "2111 2454 576") (victim_position "2113 2257 576")',
    ],
  },
  {
    pattern: 'madmilk',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "madmilk" against/,
    category: 'misc',
    description: 'Mad milk hit player (alternative format)',
    examples: [
      'L 01/02/2023 - 00:31:25: "Mr.Zergling<25><STEAM_0:0:79825490><Red>" triggered "madmilk" against "Bucuresti1010<22><STEAM_0:0:585502738><Blue>" (position "-195 241 -64") (victim_position "-280 -138 -9")',
    ],
  },
  {
    pattern: 'jarate',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]*)>" triggered "jarate" against/,
    category: 'misc',
    description: 'Jarate hit player (alternative format)',
    examples: [
      'L 05/22/2022 - 18:35:01: "(NH₄)₂U₂O₇Gamez<4><[U:1:290205612]><>" triggered "jarate" against "Mountain Man<3><[U:1:881293360]><>"',
    ],
  },

  // ========== PAUSE EVENTS ==========
  {
    pattern: 'pause',
    regex: /Game paused|triggered "pause"/,
    category: 'pause',
    description: 'Game paused',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" paused the game'],
  },
  {
    pattern: 'unpause',
    regex: /Game unpaused|triggered "unpause"/,
    category: 'pause',
    description: 'Game unpaused',
    examples: ['L 11/11/2025 - 21:53:31: "Player<1><[U:1:123]><Red>" unpaused the game'],
  },

  // ========== SPECIAL/TOURNAMENT EVENTS ==========
  {
    pattern: 'tournament_statechange',
    regex: /Tournament mode (started|ended)/,
    category: 'tournament',
    description: 'Tournament mode state change',
    examples: ['L 11/11/2025 - 21:53:31: Tournament mode started'],
  },

  // ========== NEW PATTERNS - AUTO-DISCOVERED ==========
  {
    pattern: 'medic_death_ex',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "medic_death_ex"/,
    category: 'medic',
    description: 'Extended medic death with uber percentage',
    examples: [
      'L 01/13/2019 - 20:47:59: "lsd<16><[U:1:253924652]><Blue>" triggered "medic_death_ex" (uberpct "23")',
    ],
  },
  {
    pattern: 'position_report',
    regex: /"(.+?)<(\d+)><(BOT|\[U:1:\d+\])><([^"]+)>" position_report \(position "([^"]+)"\)/,
    category: 'misc',
    description: 'Player position report',
    examples: [
      'L 01/28/2020 - 17:54:12: "Benjutsu<7><[U:1:98406217]><Spectator>" position_report (position "932 276 1559")',
      'L 01/04/2022 - 18:15:18: "NasheTv<2><BOT><Spectator>" position_report (position "922 1769 500")',
    ],
  },
  {
    pattern: 'steam_userid_validated',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]*)>" STEAM USERID validated/,
    category: 'player_state',
    description: 'Steam authentication validated',
    examples: [
      'L 02/02/2020 - 15:05:44: "Blinded<3><[U:1:243839237]><>" STEAM USERID validated',
    ],
  },
  {
    pattern: 'player_carryobject',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "player_carryobject" \(object "([^"]+)"\)/,
    category: 'objective',
    description: 'Engineer picking up building',
    examples: [
      'L 01/30/2024 - 19:14:46: "BtC<18><[U:1:1089056652]><Red>" triggered "player_carryobject" (object "OBJ_SENTRYGUN") (position "1853 1684 -479")',
    ],
  },
  {
    pattern: 'player_dropobject',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "player_dropobject" \(object "([^"]+)"\)/,
    category: 'objective',
    description: 'Engineer dropping building',
    examples: [
      'L 01/30/2024 - 19:14:53: "BtC<18><[U:1:1089056652]><Red>" triggered "player_dropobject" (object "OBJ_SENTRYGUN") (position "2224 -1056 -702")',
    ],
  },
  {
    pattern: 'changed_name',
    regex: /"(.+?)<(\d+)><(BOT|\[U:1:\d+\])><([^"]+)>" changed name to "([^"]+)"/,
    category: 'player_state',
    description: 'Player changed name',
    examples: [
      'L 01/13/2019 - 20:50:58: "Undead Domiq!<10><[U:1:236419358]><Blue>" changed name to "blanc"',
      'L 07/18/2019 - 13:29:27: "Cannon Fodder<15><BOT><Red>" changed name to "trigger_hurt"',
    ],
  },
  {
    pattern: 'Round_Setup_Begin',
    regex: /World triggered "Round_Setup_Begin"/,
    category: 'world',
    description: 'Round setup phase beginning',
    examples: [
      'L 01/30/2024 - 19:14:10: World triggered "Round_Setup_Begin"',
    ],
  },
  {
    pattern: 'meta_data',
    regex: /World triggered "meta_data"/,
    category: 'world',
    description: 'Match metadata (map, title, matchid)',
    examples: [
      'L 08/27/2025 - 03:41:07: World triggered "meta_data" (map "pass_arena2_b15")',
    ],
  },
  {
    pattern: 'Intermission_Win_Limit',
    regex: /Team "([^"]+)" triggered "Intermission_Win_Limit"/,
    category: 'world',
    description: 'Team won by reaching win limit',
    examples: [
      'L 01/13/2019 - 21:26:43: Team "BLUE" triggered "Intermission_Win_Limit"',
    ],
  },
  {
    pattern: 'log_file_started',
    regex: /Log file started/,
    category: 'server',
    description: 'Server log file started',
    examples: [
      'L 01/13/2019 - 20:47:09: Log file started (file "logs/L0113016.log") (game "/home/arie/tf2-4/tf") (version "4894223")',
    ],
  },
  {
    pattern: 'log_file_closed',
    regex: /Log file closed/,
    category: 'server',
    description: 'Server log file closed',
    examples: [
      'L 01/13/2019 - 21:26:43: Log file closed.',
    ],
  },
  {
    pattern: 'demos_tf_message',
    regex: /\[demos\.tf\]:/,
    category: 'server',
    description: 'Demos.tf plugin message',
    examples: [
      'L 01/29/2023 - 23:23:53: [demos.tf]: Demos must be at least 5 minutes long',
    ],
  },
  {
    pattern: 'server_cvars',
    regex: /Server cvars:/,
    category: 'server',
    description: 'Server console variable',
    examples: [
      'L 01/30/2024 - 19:14:15: Server cvars: mp_tournament "1"',
    ],
  },
  {
    pattern: 'sourcetv_message',
    regex: /SourceTV/,
    category: 'server',
    description: 'SourceTV relay message',
    examples: [
      'L 01/30/2024 - 19:14:20: SourceTV relay "192.168.1.1:27020" connected',
    ],
  },
  {
    pattern: 'addip_ban',
    regex: /Addip:/,
    category: 'server',
    description: 'IP ban message',
    examples: [
      'L 01/13/2019 - 20:47:10: Addip: "<><><>" was banned by IP "permanently" by "Console" (IP "0.0.0.0")',
    ],
  },
  {
    pattern: 'steamauth',
    regex: /STEAMAUTH:/,
    category: 'server',
    description: 'Steam authentication message',
    examples: [
      'L 01/15/2022 - 03:02:50: STEAMAUTH: Client kawa received failure code 6',
    ],
  },
  {
    pattern: 'Round_Setup_End',
    regex: /World triggered "Round_Setup_End"/,
    category: 'world',
    description: 'Round setup phase ended',
    examples: [
      'L 01/30/2024 - 19:15:20: World triggered "Round_Setup_End"',
    ],
  },
  {
    pattern: 'object_detonated',
    regex: /"(.+?)<(\d+)><(BOT|\[U:1:\d+\])><([^"]+)>" triggered "object_detonated"/,
    category: 'objective',
    description: 'Engineer detonated building remotely',
    examples: [
      'L 01/30/2024 - 19:17:40: "Kabel bezprzewodowy<9><[U:1:331969777]><Blue>" triggered "object_detonated" (object "OBJ_SENTRYGUN") (position "2166 143 -767")',
      'L 07/18/2019 - 13:31:10: "trigger_hurt<15><BOT><Red>" triggered "object_detonated" (object "OBJ_TELEPORTER_ENTRANCE")',
    ],
  },
  {
    pattern: 'Mini_Round_Selected',
    regex: /World triggered "Mini_Round_Selected"/,
    category: 'world',
    description: 'Arena/Pass Time mini-round selected',
    examples: [
      'L 03/18/2020 - 20:48:55: World triggered "Mini_Round_Selected" (round "round_a")',
    ],
  },
  {
    pattern: 'Mini_Round_Start',
    regex: /World triggered "Mini_Round_Start"/,
    category: 'world',
    description: 'Arena/Pass Time mini-round started',
    examples: [
      'L 03/18/2020 - 20:48:55: World triggered "Mini_Round_Start"',
    ],
  },
  {
    pattern: 'Mini_Round_Length',
    regex: /World triggered "Mini_Round_Length"/,
    category: 'world',
    description: 'Mini-round duration',
    examples: [
      'L 03/18/2020 - 20:56:28: World triggered "Mini_Round_Length" (seconds "453.60")',
    ],
  },
  {
    pattern: 'Mini_Round_Win',
    regex: /World triggered "Mini_Round_Win"/,
    category: 'world',
    description: 'Mini-round won',
    examples: [
      'L 03/18/2020 - 20:56:28: World triggered "Mini_Round_Win" (winner "Blue") (round "round_a")',
    ],
  },
  {
    pattern: 'Round_Stalemate',
    regex: /World triggered "Round_Stalemate"/,
    category: 'world',
    description: 'Round ended in stalemate',
    examples: [
      'L 01/05/2022 - 17:31:27: World triggered "Round_Stalemate"',
    ],
  },
  {
    pattern: 'Game_Paused',
    regex: /World triggered "Game_Paused"/,
    category: 'pause',
    description: 'Game paused',
    examples: [
      'L 01/09/2021 - 23:20:31: World triggered "Game_Paused"',
    ],
  },
  {
    pattern: 'Game_Unpaused',
    regex: /World triggered "Game_Unpaused"/,
    category: 'pause',
    description: 'Game unpaused',
    examples: [
      'L 06/16/2024 - 00:18:38: World triggered "Game_Unpaused"',
    ],
  },
  {
    pattern: 'matchpause',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "matchpause"/,
    category: 'pause',
    description: 'Player triggered match pause',
    examples: [
      'L 01/16/2023 - 13:31:47: "(͡ ͡° ͜ つ ͡͡°)<3><[U:1:350242480]><Blue>" triggered "matchpause"',
    ],
  },
  {
    pattern: 'matchunpause',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "matchunpause"/,
    category: 'pause',
    description: 'Player triggered match unpause',
    examples: [
      'L 01/16/2023 - 13:32:27: "Srečko dober človek<5><[U:1:380355162]><Red>" triggered "matchunpause"',
    ],
  },
  {
    pattern: 'Pause_Length',
    regex: /World triggered "Pause_Length"/,
    category: 'pause',
    description: 'Pause duration',
    examples: [
      'L 01/16/2023 - 13:32:27: World triggered "Pause_Length" (seconds "40.19")',
    ],
  },
  {
    pattern: 'Banid',
    regex: /Banid:/,
    category: 'server',
    description: 'Player banned by SteamID',
    examples: [
      'L 08/09/2020 - 05:40:10: Banid: "<><[U:1:203049126]><>" was banned "permanently" by "Console"',
    ],
  },
  {
    pattern: 'TFTrue_message',
    regex: /\[TFTrue\]/,
    category: 'server',
    description: 'TFTrue plugin message',
    examples: [
      'L 01/08/2022 - 21:58:02: [TFTrue] The log is available here: http://logs.tf/3105056. Type !log to view it.',
    ],
  },
  {
    pattern: 'META_loaded',
    regex: /\[META\] Loaded/,
    category: 'server',
    description: 'Metamod plugin loaded',
    examples: [
      'L 02/22/2023 - 15:15:18: [META] Loaded 0 plugins (1 already loaded)',
    ],
  },
  {
    pattern: 'Loading_map',
    regex: /Loading map/,
    category: 'server',
    description: 'Server loading map',
    examples: [
      'L 02/22/2023 - 15:15:18: Loading map "koth_proplant_v8"',
    ],
  },
  {
    pattern: 'server_cvars_start',
    regex: /server cvars start/,
    category: 'server',
    description: 'Server cvars section start',
    examples: [
      'L 02/22/2023 - 15:15:18: server cvars start',
    ],
  },
  {
    pattern: 'server_cvar_value',
    regex: /"[^"]+"\s*=\s*"/,
    category: 'server',
    description: 'Server console variable value',
    examples: [
      'L 02/22/2023 - 15:15:18: "sm_nextmap" = ""',
    ],
  },
  {
    pattern: 'Started_map',
    regex: /Started map/,
    category: 'server',
    description: 'Server started map',
    examples: [
      'L 02/22/2023 - 15:15:19: Started map "koth_proplant_v8" (CRC "7e56fe0974cc6fb48e84a74a94ba1f34")',
    ],
  },
  {
    pattern: 'Executing_dedicated',
    regex: /Executing dedicated server config file/,
    category: 'server',
    description: 'Executing server config file',
    examples: [
      'L 02/22/2023 - 15:15:22: Executing dedicated server config file server.cfg',
    ],
  },
  {
    pattern: 'VSCRIPT',
    regex: /VSCRIPT:/,
    category: 'server',
    description: 'VScript virtual machine message',
    examples: [
      'L 02/22/2023 - 15:15:27: VSCRIPT: Started VScript virtual machine using script language \'Squirrel\'',
    ],
  },
  {
    pattern: 'flagevent',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "flagevent"/,
    category: 'objective',
    description: 'CTF flag event',
    examples: [
      'L 01/17/2020 - 21:10:45: "AsteriX<7><[U:1:24668429]><Blue>" triggered "flagevent" (event "picked up") (cpname "#TF_Flag")',
    ],
  },
  {
    pattern: 'Script_not_found',
    regex: /Script not found/,
    category: 'server',
    description: 'VScript file not found',
    examples: [
      'L 01/17/2025 - 17:22:09: Script not found (scripts/vscripts/mapspawn.nut)',
    ],
  },
  {
    pattern: 'ClientActive_unknown_SteamID',
    regex: /WARNING: ClientActive, but we don't know his SteamID\?/,
    category: 'server',
    description: 'Client active without Steam ID',
    examples: [
      'L 01/17/2025 - 17:22:10: WARNING: ClientActive, but we don\'t know his SteamID?',
    ],
  },
  {
    pattern: 'S3_Duplicate_client',
    regex: /S3: Duplicate client connection:/,
    category: 'server',
    description: 'Duplicate client connection detected',
    examples: [
      'L 01/17/2025 - 17:23:38: S3: Duplicate client connection: UserID: 20d SteamID 4ee7c41',
    ],
  },
  {
    pattern: 'Connection_to_Steam_lost',
    regex: /Connection to Steam servers lost\./,
    category: 'server',
    description: 'Steam connection lost',
    examples: [
      'L 07/28/2018 - 14:06:21: Connection to Steam servers lost.  (Result = 3)',
    ],
  },
  {
    pattern: 'Connection_to_Steam_successful',
    regex: /Connection to Steam servers successful\./,
    category: 'server',
    description: 'Steam connection established',
    examples: [
      'L 07/28/2018 - 14:06:22: Connection to Steam servers successful.',
    ],
  },
  {
    pattern: 'Public_IP',
    regex: /Public IP is/,
    category: 'server',
    description: 'Server public IP',
    examples: [
      'L 07/28/2018 - 14:06:22:    Public IP is 0.0.0.0.',
    ],
  },
  {
    pattern: 'Assigned_gameserver_SteamID',
    regex: /Assigned anonymous gameserver Steam ID/,
    category: 'server',
    description: 'Server assigned Steam ID',
    examples: [
      'L 07/28/2018 - 14:06:22: Assigned anonymous gameserver Steam ID [A:1:3808444417:10373].',
    ],
  },
  {
    pattern: 'VAC_secure_mode',
    regex: /VAC secure mode is activated\./,
    category: 'server',
    description: 'VAC anti-cheat enabled',
    examples: [
      'L 07/28/2018 - 14:06:22: VAC secure mode is activated.',
    ],
  },
  {
    pattern: 'logs_tf_match_ended',
    regex: /\[logs\.tf\] Match ended/,
    category: 'server',
    description: 'logs.tf match completion',
    examples: [
      'L 07/21/2022 - 08:47:32: [logs.tf] Match ended (midgame 0)',
    ],
  },
  {
    pattern: 'SizzlingStats',
    regex: /\[SizzlingStats\]:/,
    category: 'server',
    description: 'SizzlingStats plugin message',
    examples: [
      'L 04/14/2018 - 23:34:17: [SizzlingStats]: sessionid CGDD5Mzb+2MahLRHSkq2YX4vM0DP+5+bbyeUuQZf8eU=',
    ],
  },
  {
    pattern: 'gas_attack',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "gas_attack" against/,
    category: 'combat',
    description: 'Gas Passer weapon attack',
    examples: [
      'L 10/06/2018 - 17:53:48: "TND | DannyL<11><[U:1:132517411]><Red>" triggered "gas_attack" against "g*y<5><[U:1:61976090]><Blue>"',
    ],
  },
  {
    pattern: 'CTFGCServerSystem',
    regex: /CTFGCServerSystem/,
    category: 'server',
    description: 'Game Coordinator server system message',
    examples: [
      'L 07/15/2018 - 20:17:23: CTFGCServerSystem - removing listener to old Steam ID [A:1:2016352267:10283]',
    ],
  },
  {
    pattern: 'server_cvar',
    regex: /server_cvar:/,
    category: 'server',
    description: 'Server console variable change',
    examples: [
      'L 05/11/2018 - 12:17:39: server_cvar: "sv_tags" "TF2Center"',
    ],
  },
  {
    pattern: 'server_cvars_end',
    regex: /server cvars end/,
    category: 'server',
    description: 'Server cvars section end',
    examples: [
      'L 09/03/2021 - 00:36:50: server cvars end',
    ],
  },
  {
    pattern: 'steam_networking_warning',
    regex: /\[SteamNetworkingSockets\] WARNING:/,
    category: 'server',
    description: 'Steam networking performance warning (debug)',
    examples: [
      'L 02/18/2022 - 20:37:18: [SteamNetworkingSockets] WARNING: SteamNetworkingSockets lock held for 6.9ms.  (Performance warning.)  SendMessageToFakeIP',
    ],
  },
  {
    pattern: 'printing_for_client',
    regex: /Printing for client:/,
    category: 'server',
    description: 'Server printing debug message',
    examples: [
      'L 04/19/2025 - 21:12:03: Printing for client: 2',
    ],
  },
  {
    pattern: 'flush_log_file',
    regex: /----- Flush Log File -----/,
    category: 'server',
    description: 'Server flushed log file to disk',
    examples: [
      'L 08/05/2018 - 21:41:38: ----- Flush Log File -----',
    ],
  },
  {
    pattern: 'demo_check',
    regex: /\[Demo Check\]/,
    category: 'server',
    description: 'Demo check plugin message',
    examples: [
      'L 05/03/2025 - 00:49:27: [Demo Check] Pimp Chimp (STEAM_0:1:82783959) [https://steamcommunity.com/profiles/76561198125833647] failed the demo check: ds_enable',
    ],
  },
  {
    pattern: 'rcon',
    regex: /rcon from/,
    category: 'server',
    description: 'Remote console command',
    examples: [
      'L 05/11/2018 - 12:17:39: rcon from "188.165.117.250:60200": command "sv_pausable 0;log 1;tv_transmit"',
    ],
  },
  {
    pattern: 'server_message',
    regex: /server_message:/,
    category: 'server',
    description: 'Server control message (quit, restart)',
    examples: [
      'L 07/16/2023 - 19:58:44: server_message: "quit"',
    ],
  },
  {
    pattern: 'pass_get',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_get"/,
    category: 'objective',
    description: 'Pass Time - player got the ball',
    examples: [
      'L 08/21/2025 - 03:25:53: "Acader<3><[U:1:1247947953><Red>" triggered "pass_get" (firstcontact "1") (position "-27 -647 -286")',
    ],
  },
  {
    pattern: 'pass_free',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_free"/,
    category: 'objective',
    description: 'Pass Time - player freed the ball',
    examples: [
      'L 08/21/2025 - 03:25:54: "Acader<3><[U:1:1247947953><Red>" triggered "pass_free" (position "40 -677 -287")',
    ],
  },
  {
    pattern: 'pass_pass_caught',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_pass_caught" against/,
    category: 'objective',
    description: 'Pass Time - player caught a pass',
    examples: [
      'L 08/21/2025 - 03:26:05: "Acader<3><[U:1:1247947953><Red>" triggered "pass_pass_caught" against "่PineappleGuy<4><[U:1:1093463818><Blue>"',
    ],
  },
  {
    pattern: 'pass_score',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_score"/,
    category: 'objective',
    description: 'Pass Time - player scored',
    examples: [
      'L 08/21/2025 - 03:25:55: "Acader<3><[U:1:1247947953><Red>" triggered "pass_score" (points "1") (panacea "0")',
    ],
  },
  {
    pattern: 'passtime_ball_spawned',
    regex: /passtime_ball spawned from/,
    category: 'objective',
    description: 'Pass Time - ball spawned',
    examples: [
      'L 09/05/2025 - 16:46:04: passtime_ball spawned from the lower spawnpoint.',
    ],
  },
  {
    pattern: 'Panacea_check',
    regex: /Panacea check - Distance from top spawner:/,
    category: 'objective',
    description: 'Pass Time - panacea bonus check',
    examples: [
      'L 08/21/2025 - 03:25:53: Panacea check - Distance from top spawner: 678, Cutoff distance for winstrat: 400',
    ],
  },
  {
    pattern: 'spawned_with_m_filter',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" spawned with m_filter on/,
    category: 'player_state',
    description: 'Player spawned with medigun filter',
    examples: [
      'L 09/05/2025 - 16:45:54: "José who nosé<190><[U:1:841095797]><Red>" spawned with m_filter on',
      'L 10/12/2025 - 21:02:20: "GuyGuyGuyGuy420<20><[U:1:1481787693><Red>" spawned with m_filter on',
    ],
  },
  {
    pattern: 'charged_with_m_filter',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" charged as /,
    category: 'medic',
    description: 'Medic charged uber with medigun filter',
    examples: [
      'L 09/05/2025 - 16:45:51: "Shorty<193><[U:1:1593126879><Blue>" charged as "demoman" with m_filter on',
      'L 10/12/2024 - 16:40:26: "CapnDuksters<98><[U:1:1587212568><Red>" charged as Demoman with m_filter on',
    ],
  },

  // ========== PASS TIME EVENTS ==========
  {
    pattern: 'pass_score_assist',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_score_assist"/,
    category: 'objective',
    description: 'Pass Time - assist on ball score',
    examples: [
      'L 01/04/2025 - 04:15:47: "Matthew Phong I<28><[U:1:131575240]><Blue>" triggered "pass_score_assist" (position "-639 -884 -1998")',
    ],
  },
  {
    pattern: 'pass_ball_stolen',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "pass_ball_stolen" against/,
    category: 'objective',
    description: 'Pass Time - player stole ball from opponent',
    examples: [
      'L 01/04/2025 - 04:17:45: "brain so big i ate an ikea<25><[U:1:139165815]><Red>" triggered "pass_ball_stolen" against "lava spire speakers ツ<22><[U:1:177956067]><Blue>" (steal defense "0") (thief_position "-43 -60 -2118") (victim_position "-3 -72 -2114")',
    ],
  },
  {
    pattern: 'passtime_ball_took_damage',
    regex: /passtime_ball took damage/,
    category: 'objective',
    description: 'Pass Time - ball took damage',
    examples: [
      'L 01/04/2025 - 04:13:40: passtime_ball took damage victim \'343\' attacker \'8\' inflictor \'413\' damage \'69.90\' damagetype \'2359360\' inflictor classname \'tf_projectile_rocket\'',
    ],
  },
  {
    pattern: 'pass_catapult',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]+)>" triggered "(red|blu)_catapult[12]"/,
    category: 'objective',
    description: 'Pass Time - player used catapult',
    examples: [
      'L 01/04/2025 - 04:15:43: "typhoon<24><[U:1:204857450]><Red>" triggered "red_catapult1" with the jack (position "-653 1395 -2031")',
    ],
  },

  // ========== ROCKET JUMP / AIRSHOT STATS ==========
  {
    pattern: 'rocket_jump',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "rocket_jump"/,
    category: 'misc',
    description: 'Soldier rocket jump',
    examples: [
      'L 04/14/2018 - 21:32:59: "NOPE<28><STEAM_0:0:160625978><Blue>" triggered "rocket_jump"',
    ],
  },
  {
    pattern: 'sticky_jump',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "sticky_jump"/,
    category: 'misc',
    description: 'Demoman sticky jump',
    examples: [
      'L 01/02/2023 - 00:24:56: "TheLife<27><STEAM_0:0:402853829><Blue>" triggered "sticky_jump"',
    ],
  },
  {
    pattern: 'sticky_jump_kill',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "sticky_jump_kill"/,
    category: 'combat',
    description: 'Kill while sticky jumping',
    examples: [
      'L 01/02/2023 - 00:25:10: "TheLife<27><STEAM_0:0:402853829><Blue>" triggered "sticky_jump_kill"',
    ],
  },
  {
    pattern: 'rocket_jump_kill',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\])><([^"]+)>" triggered "rocket_jump_kill"/,
    category: 'combat',
    description: 'Kill while rocket jumping',
    examples: [
      'L 04/14/2018 - 21:33:05: "MEGABF<20><STEAM_0:1:200218455><Red>" triggered "rocket_jump_kill"',
    ],
  },
  {
    pattern: 'airshot_rocket',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\])><([^"]+)>" triggered "airshot_rocket"/,
    category: 'combat',
    description: 'Rocket airshot',
    examples: [
      'L 04/14/2018 - 21:32:50: "MEGABF<20><STEAM_0:1:200218455><Red>" triggered "airshot_rocket"',
    ],
  },
  {
    pattern: 'air2airshot_rocket',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "air2airshot_rocket"/,
    category: 'combat',
    description: 'Air-to-air rocket shot (both players airborne)',
    examples: [
      'L 04/14/2018 - 21:33:17: "MEGABF<20><STEAM_0:1:200218455><Red>" triggered "air2airshot_rocket"',
    ],
  },
  {
    pattern: 'airshot_pipebomb',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "airshot_pipebomb"/,
    category: 'combat',
    description: 'Demoman airshot with pipes',
    examples: [
      'L 12/03/2022 - 00:39:28: "‽<11><STEAM_0:0:65926940><Blue>" triggered "airshot_pipebomb"',
    ],
  },
  {
    pattern: 'airshot_sticky',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "airshot_sticky"/,
    category: 'combat',
    description: 'Demoman airshot with stickies',
    examples: [
      'L 12/03/2022 - 00:40:30: "Player<5><STEAM_0:1:123456789><Red>" triggered "airshot_sticky"',
    ],
  },
  {
    pattern: 'airshot_stun',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "airshot_stun"/,
    category: 'combat',
    description: 'Scout sandman airshot stun',
    examples: [
      'L 12/03/2022 - 00:37:32: "미주련<10><STEAM_0:0:592525336><Red>" triggered "airshot_stun"',
    ],
  },
  {
    pattern: 'airshot_flare',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "airshot_flare"/,
    category: 'combat',
    description: 'Pyro flare gun airshot',
    examples: [
      'L 04/24/2020 - 07:12:19: "trobort<9><STEAM_0:1:33442314><Blue>" triggered "airshot_flare"',
    ],
  },
  {
    pattern: 'air2airshot_sticky',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "air2airshot_sticky"/,
    category: 'combat',
    description: 'Air-to-air sticky shot (both players airborne)',
    examples: [
      'L 04/24/2020 - 07:22:51: "spahgetticrafter33<16><STEAM_0:1:64578964><Red>" triggered "air2airshot_sticky"',
    ],
  },
  {
    pattern: 'backstab',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "backstab"/,
    category: 'combat',
    description: 'Spy backstab kill',
    examples: [
      'L 04/24/2020 - 07:12:56: "snap | Pain Seer<7><STEAM_0:1:52509525><Blue>" triggered "backstab" against "moist<5><STEAM_0:1:170455174><Red>"',
    ],
  },
  {
    pattern: 'deflected_rocket',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "deflected_rocket"/,
    category: 'combat',
    description: 'Pyro deflected rocket',
    examples: [
      'L 04/24/2020 - 07:12:42: "trobort<9><STEAM_0:1:33442314><Blue>" triggered "deflected_rocket" against "cKrow<10><STEAM_0:1:119126596><Red>" (position "-2247 -92 256") (victim_position "-2345 472 308")',
    ],
  },
  {
    pattern: 'deflected_pipebomb',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "deflected_pipebomb"/,
    category: 'combat',
    description: 'Pyro deflected pipe bomb',
    examples: [
      'L 04/24/2020 - 07:12:39: "sh_rky<12><STEAM_0:0:84004039><Red>" triggered "deflected_pipebomb" against "Constantly<13><STEAM_0:0:51870138><Blue>" (position "-1757 410 192") (victim_position "-1639 -658 131")',
    ],
  },
  {
    pattern: 'deflected_flare',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "deflected_flare"/,
    category: 'combat',
    description: 'Pyro deflected flare',
    examples: [
      'L 04/24/2020 - 07:13:00: "Player<10><STEAM_0:1:123456789><Red>" triggered "deflected_flare" against "Player2<5><STEAM_0:1:987654321><Blue>"',
    ],
  },

  // ========== CLASS-SPECIFIC DEATH TRACKING ==========
  {
    pattern: 'demoman_death',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "demoman_death" against/,
    category: 'combat',
    description: 'Demoman died with healing/uber stats',
    examples: [
      'L 05/11/2022 - 20:03:37: "steamcommunity.com/groups/FREEBOND<6><[U:1:1253894177]><Red>" triggered "demoman_death" against "steamcommunity.com/groups/FREEBOND<5><[U:1:1253894177]><Blue>" (healing "0") (ubercharge "0")',
    ],
  },
  {
    pattern: 'demoman_death_ex',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\])><([^"]+)>" triggered "demoman_death_ex"/,
    category: 'combat',
    description: 'Extended demoman death stats',
    examples: [
      'L 05/11/2022 - 20:04:18: "steamcommunity.com/groups/FREEBOND<7><[U:1:160742451]><Red>" triggered "demoman_death_ex"',
    ],
  },

  // ========== MISC COMBAT EVENTS ==========
  {
    pattern: 'defended_medic',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "defended_medic"/,
    category: 'combat',
    description: 'Player defended their medic',
    examples: [
      'L 04/14/2018 - 21:41:24: "NOPE<28><STEAM_0:0:160625978><Blue>" triggered "defended_medic"',
    ],
  },
  {
    pattern: 'headshot',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]*)>" triggered "headshot"/,
    category: 'combat',
    description: 'Sniper headshot kill',
    examples: [
      'L 05/22/2022 - 18:28:52: "Mountain Man<3><[U:1:881293360]><>" triggered "headshot"',
    ],
  },
  {
    pattern: 'airshot_headshot',
    regex: /"(.+?)<(\d+)><(\[U:1:\d+\]?)><([^"]*)>" triggered "airshot_headshot"/,
    category: 'combat',
    description: 'Airborne headshot kill',
    examples: [
      'L 05/22/2022 - 18:29:27: "Mountain Man<3><[U:1:881293360]><>" triggered "airshot_headshot"',
    ],
  },
  {
    pattern: 'crit_kill',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]*)>" triggered "crit_kill"/,
    category: 'combat',
    description: 'Kill with critical hit',
    examples: [
      'L 01/02/2023 - 00:29:49: "Bucuresti1010<22><STEAM_0:0:585502738><Blue>" triggered "crit_kill"',
    ],
  },
  {
    pattern: 'airblast_player',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "airblast_player" against/,
    category: 'combat',
    description: 'Pyro airblasted a player',
    examples: [
      'L 01/02/2023 - 00:23:49: "Mr.Zergling<25><STEAM_0:0:79825490><Red>" triggered "airblast_player" against "Bucuresti1010<22><STEAM_0:0:585502738><Blue>" (position "279 767 -64") (victim_position "316 692 -64")',
    ],
  },

  // ========== MVP TRACKING ==========
  {
    pattern: 'mvp1',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "mvp1"/,
    category: 'misc',
    description: 'Player was MVP (1st place)',
    examples: [
      'L 04/14/2018 - 21:41:57: "NOPE<28><STEAM_0:0:160625978><Blue>" triggered "mvp1"',
    ],
  },
  {
    pattern: 'mvp2',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "mvp2"/,
    category: 'misc',
    description: 'Player was MVP (2nd place)',
    examples: [
      'L 04/14/2018 - 21:41:57: "cuttingTT<32><STEAM_0:1:170233790><Blue>" triggered "mvp2"',
    ],
  },
  {
    pattern: 'mvp3',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "mvp3"/,
    category: 'misc',
    description: 'Player was MVP (3rd place)',
    examples: [
      'L 04/24/2020 - 07:18:25: "zuZ:)<14><STEAM_0:0:464123066><Blue>" triggered "mvp3"',
    ],
  },
  {
    pattern: 'steal_sandvich',
    regex: /"(.+?)<(\d+)><(STEAM_\d:\d:\d+|\[U:1:\d+\]?)><([^"]+)>" triggered "steal_sandvich"/,
    category: 'misc',
    description: 'Spy stole heavy sandvich',
    examples: [
      'L 04/24/2020 - 07:22:41: "snap | Pain Seer<7><STEAM_0:1:52509525><Blue>" triggered "steal_sandvich" against "Desq<11><STEAM_0:1:111158980><Red>" (position "-1719 743 108") (victim_position "-312 1286 256")',
    ],
  },

  // ========== WORLD/MAP EVENTS ==========
  {
    pattern: 'killlocation',
    regex: /World triggered "killlocation"/,
    category: 'world',
    description: 'Kill location tracking (attacker/victim positions)',
    examples: [
      'L 04/24/2020 - 07:12:20: World triggered "killlocation" (attacker_position "-928 1224 152") (victim_position "-1304 1212 384")',
    ],
  },
  {
    pattern: 'halloween_event',
    regex: /HALLOWEEN:/,
    category: 'world',
    description: 'Halloween event (eyeball boss, etc)',
    examples: [
      'L 12/05/2020 - 16:05:23: HALLOWEEN: eyeball_spawn (max_health 8000) (player_count 2) (level 1)',
    ],
  },
];

/**
 * Analyze a log file to detect all event types present
 */
export function analyzeLogEvents(logContent: string): {
  detectedEvents: Map<string, number>;
  unknownLines: string[];
  totalLines: number;
  categoryCounts: Map<string, number>;
} {
  const lines = logContent.split(/\r?\n/);
  const detectedEvents = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  const unknownLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine || trimmedLine.length === 0) {
      continue;
    }

    // Skip non-log lines
    if (!trimmedLine.startsWith('L ')) {
      continue;
    }

    let matched = false;

    // Check against all known patterns
    for (const eventPattern of ALL_EVENT_PATTERNS) {
      if (eventPattern.regex && eventPattern.regex.test(trimmedLine)) {
        detectedEvents.set(
          eventPattern.pattern,
          (detectedEvents.get(eventPattern.pattern) || 0) + 1
        );
        categoryCounts.set(
          eventPattern.category,
          (categoryCounts.get(eventPattern.category) || 0) + 1
        );
        matched = true;
        break;
      }
    }

    // Track unknown lines
    if (!matched) {
      unknownLines.push(trimmedLine);
    }
  }

  return {
    detectedEvents,
    unknownLines,
    totalLines: lines.filter((l) => l.trim().startsWith('L ')).length,
    categoryCounts,
  };
}

/**
 * Print analysis report
 */
export function printAnalysisReport(analysis: ReturnType<typeof analyzeLogEvents>): void {
  console.log('\n========== LOG ANALYSIS REPORT ==========\n');
  console.log(`Total log lines: ${analysis.totalLines}`);
  console.log(`Detected event types: ${analysis.detectedEvents.size}`);
  console.log(`Unknown lines: ${analysis.unknownLines.length}`);

  console.log('\n--- Events by Category ---');
  const sortedCategories = Array.from(analysis.categoryCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  for (const [category, count] of sortedCategories) {
    console.log(`  ${category}: ${count}`);
  }

  console.log('\n--- Detected Events ---');
  const sortedEvents = Array.from(analysis.detectedEvents.entries()).sort((a, b) => b[1] - a[1]);
  for (const [event, count] of sortedEvents) {
    console.log(`  ${event}: ${count}`);
  }

  if (analysis.unknownLines.length > 0) {
    console.log('\n--- Unknown Lines (first 20) ---');
    for (let i = 0; i < Math.min(20, analysis.unknownLines.length); i++) {
      console.log(`  ${analysis.unknownLines[i]}`);
    }
    if (analysis.unknownLines.length > 20) {
      console.log(`  ... and ${analysis.unknownLines.length - 20} more`);
    }
  }

  console.log('\n=========================================\n');
}

/**
 * Get event pattern by name
 */
export function getEventPattern(patternName: string): EventPattern | undefined {
  return ALL_EVENT_PATTERNS.find((p) => p.pattern === patternName);
}

/**
 * Get all patterns for a category
 */
export function getPatternsByCategory(category: string): EventPattern[] {
  return ALL_EVENT_PATTERNS.filter((p) => p.category === category);
}

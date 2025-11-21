/**
 * PlayByPlaySection Component
 * Displays a chronological timeline of key match events:
 * - Killstreaks (3+ kills within 30 seconds)
 * - Chat messages
 * - Uber events
 */

import React, { useState, useMemo } from 'react';

// Type definitions matching parser output
interface ChatMessage {
  timestamp: number;
  steamId: string;
  playerName: string;
  team: 'red' | 'blue';
  message: string;
  isTeamChat: boolean;
}

interface KillInStreak {
  victim: string;
  timestamp: number;
  weapon: string;
  secondsIntoStreak: number;
}

interface Killstreak {
  killer: string;
  killerName: string;
  team: 'red' | 'blue';
  kills: number;
  startTime: number;
  endTime: number;
  duration: number;
  victims: KillInStreak[];
}

interface UberDeathBefore {
  steamId: string;
  timestamp: number;
  secondsBeforeUber: number;
  killer?: string;
}

interface UberDeathDuring {
  steamId: string;
  timestamp: number;
  secondsIntoUber: number;
  killer?: string;
  totalDamageTaken: number;
}

interface SignificantDamage {
  steamId: string;
  damageTaken: number;
}

interface UberTracking {
  timestamp: number;
  medicSteamId: string;
  medicName: string;
  team: 'red' | 'blue';
  duration: number;
  deathsBefore: UberDeathBefore[];
  significantDamage: SignificantDamage[];
  deathsDuring: UberDeathDuring[];
  totalDamageTaken: number;
  advantageLost: number;
}

// Unified timeline event type
type TimelineEventType = 'killstreak' | 'chat' | 'uber';

interface TimelineEvent {
  type: TimelineEventType;
  timestamp: number;
  team: 'red' | 'blue';
  data: Killstreak | ChatMessage | UberTracking;
}

interface PlayByPlaySectionProps {
  killstreaks: Killstreak[];
  chat: ChatMessage[];
  ubers: UberTracking[];
  playerNames: Record<string, string>;
  matchDuration: number; // in seconds
  matchStartTime: number; // unix timestamp
}

export default function PlayByPlaySection({
  killstreaks,
  chat,
  ubers,
  playerNames,
  matchDuration,
  matchStartTime
}: PlayByPlaySectionProps) {
  // Merge all events into a single timeline
  const allEvents: TimelineEvent[] = useMemo(() => {
    const events = [
      ...killstreaks.map(ks => ({
        type: 'killstreak' as const,
        timestamp: ks.startTime,
        team: ks.team,
        data: ks,
      })),
      ...chat.map(msg => ({
        type: 'chat' as const,
        timestamp: msg.timestamp,
        team: msg.team,
        data: msg,
      })),
      ...ubers.map(uber => ({
        type: 'uber' as const,
        timestamp: uber.timestamp,
        team: uber.team,
        data: uber,
      })),
    ];

    // Sort by timestamp (oldest first)
    events.sort((a, b) => a.timestamp - b.timestamp);
    return events;
  }, [killstreaks, chat, ubers]);

  // Extract unique player names for filters
  const allPlayers = useMemo(() => {
    const names = new Set<string>();
    killstreaks.forEach(ks => names.add(ks.killerName));
    chat.forEach(msg => names.add(msg.playerName));
    ubers.forEach(uber => names.add(uber.medicName));
    return Array.from(names).sort();
  }, [killstreaks, chat, ubers]);

  const [enabledPlayers, setEnabledPlayers] = useState<Record<string, boolean>>(
    Object.fromEntries(allPlayers.map(name => [name, true]))
  );

  const [enabledEvents, setEnabledEvents] = useState<Record<string, boolean>>({
    killstreak: true,
    chat: true,
    uber: true,
  });

  const togglePlayer = (name: string) => {
    setEnabledPlayers(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleEvent = (type: string) => {
    setEnabledEvents(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Filter events based on enabled players and event types
  const filteredEvents = allEvents.filter(e => {
    if (!enabledEvents[e.type]) return false;

    if (e.type === 'killstreak') {
      const ks = e.data as Killstreak;
      return enabledPlayers[ks.killerName];
    } else if (e.type === 'chat') {
      const msg = e.data as ChatMessage;
      return enabledPlayers[msg.playerName];
    } else if (e.type === 'uber') {
      const uber = e.data as UberTracking;
      return enabledPlayers[uber.medicName];
    }
    return true;
  });

  // Format seconds to clock format (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get player name from steamId
  const getPlayerName = (steamId: string): string => {
    return playerNames[steamId] || steamId;
  };

  // Render a killstreak event
  const renderKillstreak = (ks: Killstreak, team: 'red' | 'blue') => {
    const isRed = team === 'red';

    return (
      <div className="flex w-fit px-4 py-1 rounded-md border border-warmscale-6 relative">
        <div className={`absolute ${isRed ? '-top-2 -right-1' : '-top-2 -left-1'} select-none text-yellow-400 text-sm font-bold`}>
          ⚡
        </div>
        <div className={`font-semibold ${isRed ? 'text-tf-red' : 'text-tf-blue'}`}>
          {ks.killerName}
        </div>
        <div className="mx-2 font-medium text-lightscale-3">
          {ks.kills} kill streak ({ks.duration}s)
        </div>
      </div>
    );
  };

  // Render a chat message event
  const renderChat = (msg: ChatMessage, team: 'red' | 'blue') => {
    const isRed = team === 'red';

    return (
      <div className="flex w-fit max-w-md px-4 py-1 rounded-md border border-warmscale-6 items-center gap-2 relative">
        <div className={`absolute ${isRed ? '-top-2 -right-1' : '-top-2 -left-1'} select-none text-lightscale-4 text-sm`}>
          💬
        </div>
        <div className={`font-semibold whitespace-nowrap ${isRed ? 'text-tf-red' : 'text-tf-blue'}`}>
          {msg.playerName}
        </div>
        <div className="text-lightscale-2 italic whitespace-nowrap overflow-hidden text-ellipsis">
          "{msg.message}"
        </div>
        {msg.isTeamChat && (
          <span className="text-xs text-orange-400 whitespace-nowrap">(team)</span>
        )}
      </div>
    );
  };

  // Render an uber event
  const renderUber = (uber: UberTracking, team: 'red' | 'blue') => {
    const isRed = team === 'red';
    const isBlue = team === 'blue';
    const hasDeathsDuring = uber.deathsDuring.length > 0;
    const hasDeathsBefore = uber.deathsBefore.length > 0;

    // Filter out players who died during uber from significant damage list
    const deathDuringSteamIds = new Set(uber.deathsDuring.map(d => d.steamId));
    const filteredSignificantDamage = uber.significantDamage?.filter(
      dmg => !deathDuringSteamIds.has(dmg.steamId)
    ) || [];
    const hasSignificantDamage = filteredSignificantDamage.length > 0;

    return (
      <div className={`flex flex-col w-fit px-4 py-2 rounded-md border relative ${
        isRed
          ? hasDeathsDuring ? 'bg-red-900/40 border-red-500/70' : 'bg-red-900/20 border-red-500/50'
          : hasDeathsDuring ? 'bg-blue-900/40 border-blue-500/70' : 'bg-blue-900/20 border-blue-500/50'
      }`}>
        <div className={`absolute ${isRed ? '-top-2 -right-1' : '-top-2 -left-1'} select-none text-cyan-400 text-sm`}>
          ⚕️
        </div>

        {/* Main uber info */}
        <div className="flex items-center gap-2">
          <div className={`font-semibold ${isRed ? 'text-tf-red' : 'text-tf-blue'}`}>
            {uber.medicName}
          </div>
          <div className="font-medium text-lightscale-3">
            uber ({uber.duration.toFixed(1)}s)
          </div>
        </div>

        {/* Deaths before uber */}
        {hasDeathsBefore && (
          <div className={`mt-2 pt-2 border-t ${isRed ? 'border-red-900' : 'border-blue-900'}`}>
            <div className="text-xs text-orange-400 font-semibold mb-1">Deaths before uber:</div>
            <div className="space-y-0.5">
              {uber.deathsBefore.map((death, idx) => (
                <div key={idx} className="text-xs text-lightscale-3 flex items-center gap-1">
                  <span className="text-lightscale-5">•</span>
                  <span className="font-medium">{getPlayerName(death.steamId)}</span>
                  <span className="text-lightscale-5">({death.secondsBeforeUber}s before)</span>
                  {death.killer && (
                    <span className="text-lightscale-5">by {getPlayerName(death.killer)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Significant damage during uber */}
        {hasSignificantDamage && (
          <div className={`mt-2 pt-2 border-t ${isRed ? 'border-red-900' : 'border-blue-900'}`}>
            <div className="text-xs text-yellow-400 font-semibold mb-1">Damage taken during uber (100+):</div>
            <div className="space-y-0.5">
              {filteredSignificantDamage.map((dmg, idx) => (
                <div key={idx} className="text-xs text-lightscale-3 flex items-center gap-1">
                  <span className="text-yellow-400">⚠</span>
                  <span className="font-medium">{getPlayerName(dmg.steamId)}</span>
                  <span className="text-yellow-400 font-semibold">{dmg.damageTaken} damage</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deaths during uber */}
        {hasDeathsDuring && (
          <div className={`mt-2 pt-2 border-t ${isRed ? 'border-red-900' : 'border-blue-900'}`}>
            <div className="text-xs text-red-400 font-semibold mb-1">Deaths during uber:</div>
            <div className="space-y-0.5">
              {uber.deathsDuring.map((death, idx) => (
                <div key={idx} className="text-xs text-red-300 flex items-center gap-1">
                  <span className="text-red-500">✖</span>
                  <span className="font-medium">{getPlayerName(death.steamId)}</span>
                  <span className="text-lightscale-5">({death.secondsIntoUber}s in, {death.totalDamageTaken} dmg)</span>
                  {death.killer && (
                    <span className="text-lightscale-5">by {getPlayerName(death.killer)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 text-warmscale-8 dark:text-lightscale-5 bg-warmscale-9/50 font-ttnorms p-10">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-6 border-b border-warmscale-6 pb-4">
        <div>
          <div className="font-bold mb-2 text-lightscale-1">Players</div>
          <div className="flex flex-wrap gap-2">
            {allPlayers.map(name => (
              <label key={name} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={enabledPlayers[name]}
                  onChange={() => togglePlayer(name)}
                  className="cursor-pointer"
                />
                <span className="text-lightscale-3">{name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="font-bold mb-2 text-lightscale-1">Events</div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={enabledEvents.killstreak}
                onChange={() => toggleEvent('killstreak')}
                className="cursor-pointer"
              />
              <span className="text-lightscale-3">Killstreaks</span>
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={enabledEvents.chat}
                onChange={() => toggleEvent('chat')}
                className="cursor-pointer"
              />
              <span className="text-lightscale-3">Chat</span>
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={enabledEvents.uber}
                onChange={() => toggleEvent('uber')}
                className="cursor-pointer"
              />
              <span className="text-lightscale-3">Ubers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-lightscale-4">
          No events match your filters.
        </div>
      ) : (() => {
        // Calculate actual match start time from ALL events (not just filtered)
        const actualMatchStartTime = matchStartTime || Math.min(...allEvents.map(e => e.timestamp));

        // Format game time (seconds into match) as MM:SS
        const formatGameTime = (eventTimestamp: number): string => {
          const secondsIntoMatch = eventTimestamp - actualMatchStartTime;
          const mins = Math.floor(secondsIntoMatch / 60);
          const secs = Math.floor(secondsIntoMatch % 60);
          return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        return (
          <div className="relative flex flex-col gap-2">
            {/* Center vertical timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-warmscale-6 -translate-x-1/2 pointer-events-none" />

            {filteredEvents.map((e, i) => {
              const isRed = e.team === 'red';
              const isBlue = e.team === 'blue';

              let content = null;
              if (e.type === 'killstreak') {
                content = renderKillstreak(e.data as Killstreak, e.team);
              } else if (e.type === 'chat') {
                content = renderChat(e.data as ChatMessage, e.team);
              } else if (e.type === 'uber') {
                content = renderUber(e.data as UberTracking, e.team);
              }

              const gameTime = formatGameTime(e.timestamp);

              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_1fr] items-center text-sm text-warmscale-2 dark:text-lightscale-5 relative z-10"
                >
                  {/* Left side - BLUE team */}
                  <div className="flex justify-end items-center">
                    {isBlue ? content : null}
                  </div>
                  {/* Center - timestamp */}
                  <div className="text-center text-lightscale-4 font-mono text-xs bg-warmscale-9">
                    {gameTime}
                  </div>
                  {/* Right side - RED team */}
                  <div className="flex justify-start items-center">
                    {isRed ? content : null}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}

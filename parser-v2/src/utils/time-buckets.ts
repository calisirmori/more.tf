/**
 * Time Bucketing System
 * Organizes events into 10-second intervals for the slider feature
 */

import { GameEvent } from '../types/events';

export const BUCKET_INTERVAL_SECONDS = 10;

export interface TimeBucket {
  startTime: number; // Unix timestamp (seconds)
  endTime: number; // Unix timestamp (seconds)
  bucketIndex: number; // 0-based index
  events: GameEvent[];
}

export interface TimeBucketedData {
  bucketIntervalSeconds: number;
  totalBuckets: number;
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  buckets: TimeBucket[];
}

/**
 * Create time buckets from events
 * Events are grouped into 10-second intervals
 */
export function createTimeBuckets(
  events: GameEvent[],
  intervalSeconds: number = BUCKET_INTERVAL_SECONDS
): TimeBucketedData {
  if (events.length === 0) {
    return {
      bucketIntervalSeconds: intervalSeconds,
      totalBuckets: 0,
      matchStartTime: 0,
      matchEndTime: 0,
      matchDurationSeconds: 0,
      buckets: [],
    };
  }

  // Find match start and end times
  const timestamps = events.map((e) => e.timestamp);
  const matchStartTime = Math.min(...timestamps);
  const matchEndTime = Math.max(...timestamps);
  const matchDurationSeconds = matchEndTime - matchStartTime;

  // Calculate number of buckets needed
  const totalBuckets = Math.ceil(matchDurationSeconds / intervalSeconds) + 1;

  // Initialize buckets
  const buckets: TimeBucket[] = [];
  for (let i = 0; i < totalBuckets; i++) {
    const startTime = matchStartTime + i * intervalSeconds;
    const endTime = startTime + intervalSeconds;

    buckets.push({
      startTime,
      endTime,
      bucketIndex: i,
      events: [],
    });
  }

  // Assign events to buckets
  for (const event of events) {
    const bucketIndex = Math.floor((event.timestamp - matchStartTime) / intervalSeconds);

    // Safety check
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].events.push(event);
    }
  }

  return {
    bucketIntervalSeconds: intervalSeconds,
    totalBuckets,
    matchStartTime,
    matchEndTime,
    matchDurationSeconds,
    buckets,
  };
}

/**
 * Get bucket for a specific timestamp
 */
export function getBucketForTimestamp(
  bucketed: TimeBucketedData,
  timestamp: number
): TimeBucket | undefined {
  const index = Math.floor((timestamp - bucketed.matchStartTime) / bucketed.bucketIntervalSeconds);

  if (index >= 0 && index < bucketed.buckets.length) {
    return bucketed.buckets[index];
  }

  return undefined;
}

/**
 * Get buckets in a time range
 */
export function getBucketsInRange(
  bucketed: TimeBucketedData,
  startTime: number,
  endTime: number
): TimeBucket[] {
  return bucketed.buckets.filter((bucket) => {
    return bucket.startTime < endTime && bucket.endTime > startTime;
  });
}

/**
 * Get bucket statistics
 */
export interface BucketStats {
  bucketIndex: number;
  startTime: number;
  endTime: number;
  totalEvents: number;
  kills: number;
  damage: number;
  healing: number;
  ubers: number;
}

export function getBucketStats(bucket: TimeBucket): BucketStats {
  const stats: BucketStats = {
    bucketIndex: bucket.bucketIndex,
    startTime: bucket.startTime,
    endTime: bucket.endTime,
    totalEvents: bucket.events.length,
    kills: 0,
    damage: 0,
    healing: 0,
    ubers: 0,
  };

  for (const event of bucket.events) {
    switch (event.type) {
      case 'kill':
        stats.kills++;
        break;
      case 'damage':
        stats.damage += event.damage;
        break;
      case 'heal':
        stats.healing += event.healing;
        break;
      case 'charge_deployed':
        stats.ubers++;
        break;
    }
  }

  return stats;
}

/**
 * Get statistics for all buckets
 */
export function getAllBucketStats(bucketed: TimeBucketedData): BucketStats[] {
  return bucketed.buckets.map(getBucketStats);
}

/**
 * Format timestamp relative to match start
 */
export function formatRelativeTime(timestamp: number, matchStartTime: number): string {
  const seconds = Math.floor(timestamp - matchStartTime);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format bucket time range
 */
export function formatBucketRange(bucket: TimeBucket, matchStartTime: number): string {
  const start = formatRelativeTime(bucket.startTime, matchStartTime);
  const end = formatRelativeTime(bucket.endTime, matchStartTime);
  return `${start} - ${end}`;
}

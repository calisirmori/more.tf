/**
 * Utility functions for Match History
 */

/**
 * Formats map name by extracting and capitalizing the main part
 * Example: "cp_process_final" => "Process"
 */
export function formatMapName(map: string): string {
  const parts = map.split('_');
  const mapName = parts[1] || map;
  return mapName.charAt(0).toUpperCase() + mapName.slice(1);
}

/**
 * Formats match title by removing serveme prefix
 */
export function formatMatchTitle(title: string): string {
  if (title.includes('serveme')) {
    return title.slice(23);
  }
  return title;
}

/**
 * Formats match duration as MM:SS
 */
export function formatMatchLength(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Formats time ago string
 */
export function formatTimeAgo(matchDate: number, currentTime: number): string {
  const timeDiff = currentTime - matchDate;

  if (timeDiff > 86400) {
    // More than a day ago, show date
    return new Date(matchDate * 1000).toLocaleDateString();
  }

  // Less than a day ago, show hours
  const hoursAgo = Math.round(timeDiff / 3600);
  return `${hoursAgo} hrs ago`;
}

/**
 * Formats format abbreviation
 */
export function formatFormatAbbr(format: string): string {
  if (format === 'other') return 'OTH';
  return format.toUpperCase();
}

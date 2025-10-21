// Season information types
export interface SeasonInfo {
  leauge: "RGL" | "OZF";
  format: "HL" | "6S" | "LAN";
  season: number | string;
}

export type SeasonId = string | number;

export interface SeasonMap {
  [key: SeasonId]: SeasonInfo;
}

// RGL Seasons
export const RGL_SEASONS: SeasonMap = {
  144: {
    leauge: "RGL",
    format: "HL",
    season: 16,
  },
  148: {
    leauge: "RGL",
    format: "6S",
    season: 14,
  },
  147: {
    leauge: "RGL",
    format: "HL",
    season: 17,
  },
  151: {
    leauge: "RGL",
    format: "HL",
    season: 18,
  },
  153: {
    leauge: "RGL",
    format: "6S",
    season: 15,
  },
  155: {
    leauge: "RGL",
    format: "6S",
    season: 16,
  },
  156: {
    leauge: "RGL",
    format: "HL",
    season: 19,
  },
  158: {
    leauge: "RGL",
    format: "HL",
    season: 20,
  },
  159: {
    leauge: "RGL",
    format: "6S",
    season: 17,
  },
  163: {
    leauge: "RGL",
    format: "HL",
    season: 21,
  },
  164: {
    leauge: "RGL",
    format: "6S",
    season: 18,
  },
  166: {
    leauge: "RGL",
    format: "HL",
    season: 22,
  },
  165: {
    leauge: "RGL",
    format: "6S",
    season: 19,
  },
};

// OZF Seasons
export const OZF_SEASONS: SeasonMap = {
  67: {
    leauge: "OZF",
    format: "6S",
    season: 40,
  },
  69: {
    leauge: "OZF",
    format: "HL",
    season: 8,
  },
  70: {
    leauge: "OZF",
    format: "6S",
    season: 41,
  },
  73: {
    leauge: "OZF",
    format: "HL",
    season: 9,
  },
  74: {
    leauge: "OZF",
    format: "6S",
    season: 42,
  },
  80: {
    leauge: "OZF",
    format: "HL",
    season: 10,
  },
  81: {
    leauge: "OZF",
    format: "6S",
    season: 43,
  },
  79: {
    leauge: "OZF",
    format: "LAN",
    season: "2025",
  },
  84: {
    leauge: "OZF",
    format: "6S",
    season: 44,
  },
  83: {
    leauge: "OZF",
    format: "HL",
    season: 11,
  },
};

// Combined season map
export const ALL_SEASONS: SeasonMap = {
  ...RGL_SEASONS,
  ...OZF_SEASONS,
};

// Helper functions
export const getCurrentRGLHL = () => "166";
export const getCurrentRGL6S = () => "165";
export const getCurrentOZFHL = () => "80";
export const getCurrentOZF6S = () => "81";

// Get seasons by format
export const getSeasonsByFormat = (format: "HL" | "6S" | "LAN", league?: "RGL" | "OZF"): [string, SeasonInfo][] => {
  const seasons = league === "RGL" ? RGL_SEASONS : league === "OZF" ? OZF_SEASONS : ALL_SEASONS;
  return Object.entries(seasons).filter(([_, details]) => details.format === format);
};

// Centralized rarity mapping for card divisions
// Maps division names to rarity tiers across different leagues and seasons
// Last updated: 2025-01-18 (found 16 unique divisions in database)

const RARITY_TIERS = {
  LEGENDARY: 'legendary',
  EPIC: 'epic',
  RARE: 'rare',
  UNCOMMON: 'uncommon',
  COMMON: 'common'
};

// Division to rarity mapping
// All known division names from database (case-insensitive)
const DIVISION_RARITY_MAP = {
  // ============= LEGENDARY (Top Tier) =============
  // Invite divisions
  'invite': RARITY_TIERS.LEGENDARY,
  'invite - powered by mannco.store': RARITY_TIERS.LEGENDARY,

  // Premier divisions
  'premier': RARITY_TIERS.LEGENDARY,

  // Division 1 variants
  'division 1': RARITY_TIERS.LEGENDARY,
  'div 1': RARITY_TIERS.LEGENDARY,
  'div-1': RARITY_TIERS.LEGENDARY,

  // ============= EPIC (Second Tier) =============
  // Advanced divisions
  'advanced': RARITY_TIERS.EPIC,
  'advanced-1': RARITY_TIERS.EPIC,
  'advanced-2': RARITY_TIERS.EPIC,

  // High divisions (OZF)
  'high': RARITY_TIERS.EPIC,

  // Division 2 variants
  'division 2': RARITY_TIERS.EPIC,
  'div 2': RARITY_TIERS.EPIC,
  'div-2': RARITY_TIERS.EPIC,

  // ============= RARE (Third Tier) =============
  // Main divisions
  'main': RARITY_TIERS.RARE,

  // Division 3 variants
  'division 3': RARITY_TIERS.RARE,
  'div 3': RARITY_TIERS.RARE,
  'div-3': RARITY_TIERS.RARE,

  // ============= UNCOMMON (Fourth Tier) =============
  // Intermediate divisions
  'intermediate': RARITY_TIERS.UNCOMMON,
  'intermediate (non-playoff teams)': RARITY_TIERS.UNCOMMON,

  // Division 4 variants
  'division 4': RARITY_TIERS.UNCOMMON,
  'div 4': RARITY_TIERS.UNCOMMON,
  'div-4': RARITY_TIERS.UNCOMMON,

  // ============= COMMON (All other divisions) =============
  // Amateur divisions
  'amateur': RARITY_TIERS.COMMON,
  'amateur prime': RARITY_TIERS.COMMON,

  // Newcomer divisions
  'newcomer': RARITY_TIERS.COMMON,

  // Open divisions
  'open': RARITY_TIERS.COMMON,
  'fresh meat': RARITY_TIERS.COMMON,

  // Division 5+ variants
  'division 5': RARITY_TIERS.COMMON,
  'div 5': RARITY_TIERS.COMMON,
  'div-5': RARITY_TIERS.COMMON,
  'division 6': RARITY_TIERS.COMMON,
  'div 6': RARITY_TIERS.COMMON,
  'div-6': RARITY_TIERS.COMMON
};

// Fuzzy matching patterns for unknown divisions
// These patterns check if a division name contains certain keywords
const FUZZY_PATTERNS = [
  { pattern: /invite/i, rarity: RARITY_TIERS.LEGENDARY },
  { pattern: /premier/i, rarity: RARITY_TIERS.LEGENDARY },
  { pattern: /div[-\s]?1/i, rarity: RARITY_TIERS.LEGENDARY },
  { pattern: /division[-\s]?1/i, rarity: RARITY_TIERS.LEGENDARY },

  { pattern: /advanced/i, rarity: RARITY_TIERS.EPIC },
  { pattern: /high/i, rarity: RARITY_TIERS.EPIC },
  { pattern: /div[-\s]?2/i, rarity: RARITY_TIERS.EPIC },
  { pattern: /division[-\s]?2/i, rarity: RARITY_TIERS.EPIC },

  { pattern: /main/i, rarity: RARITY_TIERS.RARE },
  { pattern: /div[-\s]?3/i, rarity: RARITY_TIERS.RARE },
  { pattern: /division[-\s]?3/i, rarity: RARITY_TIERS.RARE },

  { pattern: /intermediate/i, rarity: RARITY_TIERS.UNCOMMON },
  { pattern: /div[-\s]?4/i, rarity: RARITY_TIERS.UNCOMMON },
  { pattern: /division[-\s]?4/i, rarity: RARITY_TIERS.UNCOMMON },

  { pattern: /amateur/i, rarity: RARITY_TIERS.COMMON },
  { pattern: /newcomer/i, rarity: RARITY_TIERS.COMMON },
  { pattern: /open/i, rarity: RARITY_TIERS.COMMON },
  { pattern: /fresh/i, rarity: RARITY_TIERS.COMMON }
];

/**
 * Get rarity tier for a given division with intelligent fallback
 * @param {string} division - The division name (case-insensitive)
 * @param {boolean} logUnknown - Whether to log unknown divisions (default: true)
 * @returns {string} Rarity tier (legendary, epic, rare, uncommon, or common)
 */
function getRarityFromDivision(division, logUnknown = true) {
  if (!division) {
    return RARITY_TIERS.COMMON;
  }

  const normalizedDivision = division.toLowerCase().trim();

  // Try exact match first
  if (DIVISION_RARITY_MAP[normalizedDivision]) {
    return DIVISION_RARITY_MAP[normalizedDivision];
  }

  // Try fuzzy matching if no exact match
  for (const { pattern, rarity } of FUZZY_PATTERNS) {
    if (pattern.test(normalizedDivision)) {
      if (logUnknown) {
        console.warn(`[RarityMapping] Unknown division "${division}" matched to ${rarity} via fuzzy pattern. Consider adding to DIVISION_RARITY_MAP.`);
      }
      return rarity;
    }
  }

  // Default to common and log warning
  if (logUnknown) {
    console.warn(`[RarityMapping] Unknown division "${division}" defaulted to ${RARITY_TIERS.COMMON}. Consider adding to DIVISION_RARITY_MAP.`);
  }
  return RARITY_TIERS.COMMON;
}

/**
 * Check if a division should have holo effect (invite/premier only)
 * @param {string} division - The division name
 * @returns {boolean} True if should be holo
 */
function isHoloDivision(division) {
  return getRarityFromDivision(division) === RARITY_TIERS.LEGENDARY;
}

/**
 * Get all divisions for a specific rarity tier
 * @param {string} rarity - The rarity tier
 * @returns {string[]} Array of division names
 */
function getDivisionsForRarity(rarity) {
  return Object.entries(DIVISION_RARITY_MAP)
    .filter(([_, divRarity]) => divRarity === rarity)
    .map(([division, _]) => division);
}

/**
 * Normalize division name for asset loading (borders, medals, etc.)
 * Maps division variants to their base asset name
 * @param {string} division - The full division name
 * @returns {string} Normalized division name for asset files
 */
function normalizeDivisionForAssets(division) {
  if (!division) {
    return 'unknown';
  }

  const normalized = division.toLowerCase().trim();

  // Map variants to base division names that have actual asset files
  // Available assets: invite, advanced, main, intermediate, amateur, newcomer
  const assetMapping = {
    // Invite variants -> invite (LEGENDARY tier)
    'invite': 'invite',
    'invite - powered by mannco.store': 'invite',
    'premier': 'invite', // OZF equivalent of invite

    // Division 1 variants -> invite
    'div-1': 'invite',
    'division 1': 'invite',
    'div 1': 'invite',

    // Advanced variants -> advanced (EPIC tier)
    'advanced': 'advanced',
    'advanced-1': 'advanced',
    'advanced-2': 'advanced',
    'high': 'advanced', // OZF equivalent of advanced

    // Division 2 variants -> advanced
    'div-2': 'advanced',
    'division 2': 'advanced',
    'div 2': 'advanced',

    // Main variants -> main (RARE tier)
    'main': 'main',
    'div-3': 'main',
    'division 3': 'main',
    'div 3': 'main',

    // Intermediate variants -> intermediate (UNCOMMON tier)
    'intermediate': 'intermediate',
    'intermediate (non-playoff teams)': 'intermediate',
    'div-4': 'intermediate',
    'division 4': 'intermediate',
    'div 4': 'intermediate',

    // Amateur variants -> amateur (COMMON tier)
    'amateur': 'amateur',
    'amateur prime': 'amateur',
    'div-5': 'amateur',
    'division 5': 'amateur',
    'div 5': 'amateur',

    // Newcomer/Open variants -> newcomer (COMMON tier)
    'newcomer': 'newcomer',
    'open': 'newcomer', // Map open to newcomer (both are entry level)
    'div-6': 'newcomer',
    'division 6': 'newcomer',
    'div 6': 'newcomer'
  };

  return assetMapping[normalized] || 'amateur'; // Default to amateur instead of unknown
}

/**
 * Get numeric tier for sorting divisions (1 = highest)
 * @param {string} division - The division name
 * @returns {number} Sort order (1-5, with 6 as fallback for unknown)
 */
function getDivisionSortOrder(division) {
  const rarity = getRarityFromDivision(division, false); // Don't log for sorting

  switch (rarity) {
    case RARITY_TIERS.LEGENDARY:
      return 1;
    case RARITY_TIERS.EPIC:
      // Handle advanced-1 vs advanced-2 sub-ordering
      if (division && division.toLowerCase().includes('advanced-1')) {
        return 2;
      } else if (division && division.toLowerCase().includes('advanced-2')) {
        return 3;
      }
      return 2;
    case RARITY_TIERS.RARE:
      return 4;
    case RARITY_TIERS.UNCOMMON:
      return 5;
    case RARITY_TIERS.COMMON:
      return 6;
    default:
      return 7; // Unknown fallback
  }
}

module.exports = {
  RARITY_TIERS,
  DIVISION_RARITY_MAP,
  FUZZY_PATTERNS,
  getRarityFromDivision,
  isHoloDivision,
  getDivisionsForRarity,
  getDivisionSortOrder,
  normalizeDivisionForAssets
};

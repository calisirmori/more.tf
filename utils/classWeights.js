/**
 * Universal weight system for player card ratings
 * All classes use the same formula
 *
 * Stats:
 * - CBT (Combat/Kills): Player eliminations
 * - EFF (Efficiency): K/D ratio
 * - EVA (Evasion): DTM (Damage Taken/Mitigated)
 * - IMP (Impact/Damage): Damage dealt
 * - SPT (Support): Assists
 * - SRV (Survivability): Deaths
 *
 * Formula: (CBT*2 + EFF*0.5 + EVA*0.5 + DMG*2 + SPT*1 + SRV*1) / 7.0
 */

// Universal weights - all classes use the same formula
const UNIVERSAL_WEIGHTS = {
  cbt: 2.0, // KILLS (Combat)
  eff: 0.5, // K/D (Efficiency)
  eva: 0.5, // DTM (Evasion - Damage Taken/Mitigated)
  imp: 2.0, // DAMAGE (Impact)
  spt: 1.0, // ASSISTS (Support)
  srv: 1.0, // DEATHS (Survivability)
  divisor: 7.0
};

/**
 * Normalize class name
 */
function normalizeClassName(className) {
  if (!className) return null;
  return className.toLowerCase().trim();
}

/**
 * Get weights - all classes use universal weights
 */
function getClassWeights(className) {
  return UNIVERSAL_WEIGHTS;
}

/**
 * Calculate overall rating for a player based on their class
 * Returns the raw decimal value for precise display
 */
function calculateOverall(player) {
  const weights = getClassWeights(player.class);

  const overall =
    (player.cbt * weights.cbt +
      player.eff * weights.eff +
      player.eva * weights.eva +
      player.imp * weights.imp +
      player.spt * weights.spt +
      player.srv * weights.srv) /
    weights.divisor;

  return overall;
}

/**
 * Check if a class should display "HLG" instead of "DMG"
 */
function shouldDisplayHealing(className) {
  const normalized = normalizeClassName(className);
  return normalized === 'medic';
}

module.exports = {
  UNIVERSAL_WEIGHTS,
  getClassWeights,
  calculateOverall,
  shouldDisplayHealing,
  normalizeClassName
};

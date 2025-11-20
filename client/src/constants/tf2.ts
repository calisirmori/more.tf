/**
 * TF2 Constants
 * Canonical class order and other TF2-related constants
 */

export const TF2_CLASS_ORDER = [
  'scout',
  'soldier',
  'pyro',
  'demoman',
  'heavyweapons',
  'engineer',
  'medic',
  'sniper',
  'spy',
] as const;

export type TF2Class = typeof TF2_CLASS_ORDER[number];

/**
 * Get the numeric order index for a class (lower = earlier in order)
 */
export const getClassOrder = (className: string): number => {
  const normalized = className.toLowerCase();
  const index = TF2_CLASS_ORDER.indexOf(normalized as TF2Class);
  return index === -1 ? 999 : index;
};

/**
 * Display names for TF2 classes
 */
export const TF2_CLASS_DISPLAY_NAMES: Record<string, string> = {
  scout: 'Scout',
  soldier: 'Soldier',
  pyro: 'Pyro',
  demoman: 'Demoman',
  heavyweapons: 'Heavy',
  engineer: 'Engineer',
  medic: 'Medic',
  sniper: 'Sniper',
  spy: 'Spy',
};

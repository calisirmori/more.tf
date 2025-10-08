// Class specialty types
export interface ClassSpecialty {
  id: string;
  name: string;
  title: string;
  perMinute: boolean;
}

export interface ClassSpecialties {
  [key: string]: ClassSpecialty;
  scout: ClassSpecialty;
  soldier: ClassSpecialty;
  pyro: ClassSpecialty;
  demoman: ClassSpecialty;
  heavyweapons: ClassSpecialty;
  engineer: ClassSpecialty;
  medic: ClassSpecialty;
  sniper: ClassSpecialty;
  spy: ClassSpecialty;
}

export interface FormatClassSpecialties {
  "6S": ClassSpecialties;
  HL: ClassSpecialties;
  LAN: ClassSpecialties;
}

// 6S Class Specialties
const SIXS_SPECIALTIES: ClassSpecialties = {
  scout: {
    id: "acc",
    name: "Accuracy",
    title: "ACC",
    perMinute: false,
  },
  soldier: {
    id: "airshots",
    name: "Total Airshots",
    title: "Airshots",
    perMinute: false,
  },
  pyro: {
    id: "spykills",
    name: "Spy Kills Per Minute",
    title: "Spy Kills/m",
    perMinute: true,
  },
  demoman: {
    id: "airshots",
    name: "Total Airshots",
    title: "Airshots",
    perMinute: false,
  },
  heavyweapons: {
    id: "hr",
    name: "Heals Received",
    title: "HR/m",
    perMinute: true,
  },
  engineer: {
    id: "sentry_dmg",
    name: "Sentry Damage",
    title: "Sentry DMG",
    perMinute: true,
  },
  medic: {
    id: "heals",
    name: "Heals Per Minute",
    title: "Heals/m",
    perMinute: true,
  },
  sniper: {
    id: "hs",
    name: "Headshots Per Minute",
    title: "HS/m",
    perMinute: true,
  },
  spy: {
    id: "bs",
    name: "Backstabs Per Minute",
    title: "BS/m",
    perMinute: true,
  },
};

// Highlander Class Specialties
const HL_SPECIALTIES: ClassSpecialties = {
  scout: {
    id: "bleed",
    name: "Bleed Damage Per Minute",
    title: "Bleed/m",
    perMinute: true,
  },
  soldier: {
    id: "airshots",
    name: "Total Airshots",
    title: "Airshots",
    perMinute: false,
  },
  pyro: {
    id: "spykills",
    name: "Spy Kills Per Minute",
    title: "Spy Kills/m",
    perMinute: true,
  },
  demoman: {
    id: "airshots",
    name: "Total Airshots",
    title: "Airshots",
    perMinute: false,
  },
  heavyweapons: {
    id: "hr",
    name: "Heals Received",
    title: "HR/m",
    perMinute: true,
  },
  engineer: {
    id: "sentry_dmg",
    name: "Sentry Damage",
    title: "Sentry DMG",
    perMinute: true,
  },
  medic: {
    id: "heals",
    name: "Heals Per Minute",
    title: "Heals/m",
    perMinute: true,
  },
  sniper: {
    id: "hs",
    name: "Headshots Per Minute",
    title: "HS/m",
    perMinute: true,
  },
  spy: {
    id: "bs",
    name: "Backstabs Per Minute",
    title: "BS/m",
    perMinute: true,
  },
};

// LAN uses 6S specialties
const LAN_SPECIALTIES: ClassSpecialties = SIXS_SPECIALTIES;

// Export combined object
export const CLASS_SPECIALTIES: FormatClassSpecialties = {
  "6S": SIXS_SPECIALTIES,
  HL: HL_SPECIALTIES,
  LAN: LAN_SPECIALTIES,
};

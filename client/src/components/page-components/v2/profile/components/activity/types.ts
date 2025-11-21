/**
 * TypeScript types for Activity components
 */

export interface ActivityData {
  [weekIndex: number]: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export interface ActivityMatch {
  date: number; // Unix timestamp
}

/**
 * Utility functions for Activity components
 */

import { ActivityData, ActivityMatch } from './types';

const dayOfTheWeekFinder: Record<number, keyof Omit<ActivityData[number], 'length'>> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

/**
 * Transforms raw activity match data into calendar format
 */
export function processActivityData(inputArray: ActivityMatch[]): ActivityData {
  const activityObject: ActivityData = {};

  inputArray.forEach((match) => {
    const weekIndex = Math.ceil((match.date + 86400 * 2) / 604800);
    const dayIndex = Math.ceil((match.date + 86400 * 2) / 86400) % 7;
    const dayName = dayOfTheWeekFinder[dayIndex];

    if (activityObject[weekIndex] === undefined) {
      activityObject[weekIndex] = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0,
      };
    }

    activityObject[weekIndex][dayName]++;
  });

  return activityObject;
}

/**
 * ActivityCalendar Component
 * Displays player activity in a GitHub-style contribution calendar
 */

import { ActivityData } from './types';

interface ActivityCalendarProps {
  activity: ActivityData;
  playerId: string;
}

export default function ActivityCalendar({ activity, playerId }: ActivityCalendarProps) {
  const weeksToShow = 17;
  const daysOfTheWeek = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Calculate the Monday of the week that was 17 weeks ago
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(
    today.getDate() - (weeksToShow - 1) * 7 - ((today.getDay() + 6) % 7)
  );
  startDate.setHours(0, 0, 0, 0);

  const getOpacity = (games: number): number => {
    if (games === 0) return 0;
    if (games === 1) return 0.3;
    if (games === 2) return 0.5;
    if (games === 3) return 0.7;
    return 1;
  };

  const getDateForWeekAndDay = (weekOffset: number, dayIndex: number): Date => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + weekOffset * 7 + dayIndex);
    return date;
  };

  const getWeekIndexForDate = (date: Date): number => {
    const timestamp = Math.floor(date.getTime() / 1000);
    return Math.ceil((timestamp + 86400 * 2) / 604800);
  };

  const isToday = (date: Date): boolean => {
    const todayDate = new Date();
    return date.toDateString() === todayDate.toDateString();
  };

  const isFuture = (date: Date): boolean => {
    return date > new Date();
  };

  if (Object.keys(activity).length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-warmscale-8 rounded-md px-4 py-3 mb-4 font-cantarell">
      <div className="flex justify-between items-center mb-3">
        <div className="text-lg text-lightscale-1 font-semibold">Activity</div>
        <a
          href={`/calendar/${playerId}`}
          className="text-lg text-lightscale-1 font-semibold"
        >
          <svg
            strokeWidth={5.5}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="stroke-warmscale-2 cursor-pointer h-6 mt-1 py-1 px-2 rounded-md hover:stroke-warmscale-1 hover:bg-warmscale-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
            />
          </svg>
        </a>
      </div>

      <div className="flex gap-1 w-full">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-[10px] font-semibold text-lightscale-4 justify-between py-0.5 flex-shrink-0">
          {dayLabels.map((label) => (
            <div key={label} className="h-3 flex items-center">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-1 flex-1 justify-between">
          {Array.from({ length: weeksToShow }).map((_, weekOffset) => (
            <div key={weekOffset} className="flex flex-col gap-1 flex-1">
              {daysOfTheWeek.map((day, dayIndex) => {
                const date = getDateForWeekAndDay(weekOffset, dayIndex);
                const weekIndex = getWeekIndexForDate(date);
                const weekData = activity[weekIndex];
                const games = weekData ? weekData[day as keyof typeof weekData] : 0;
                const opacity = getOpacity(games);
                const future = isFuture(date);
                const todayHighlight = isToday(date);

                return (
                  <div
                    key={day}
                    className="relative group"
                    title={`${games} games on ${date.toLocaleDateString()}`}
                  >
                    <div
                      className={`w-full aspect-square rounded-sm ${
                        future
                          ? 'bg-warmscale-6'
                          : games === 0
                            ? 'bg-warmscale-6'
                            : 'bg-tf-orange'
                      } ${todayHighlight ? 'ring-1 ring-warmscale-3 ring-opacity-50' : ''}`}
                      style={{
                        opacity: future ? 0.3 : games === 0 ? 1 : opacity,
                      }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-warmscale-9 text-lightscale-2 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-opacity">
                      {games} {games === 1 ? 'game' : 'games'}
                      <div className="text-lightscale-6">
                        {date.toLocaleDateString()}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-warmscale-9" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-lightscale-6">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-warmscale-6 rounded-sm" />
          <div
            className="w-3 h-3 bg-tf-orange rounded-sm"
            style={{ opacity: 0.3 }}
          />
          <div
            className="w-3 h-3 bg-tf-orange rounded-sm"
            style={{ opacity: 0.5 }}
          />
          <div
            className="w-3 h-3 bg-tf-orange rounded-sm"
            style={{ opacity: 0.7 }}
          />
          <div className="w-3 h-3 bg-tf-orange rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

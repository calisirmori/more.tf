/**
 * TimeBar - Interactive time scrubber for logs with range selection
 * Allows users to select a time range and view stats for that period
 */

import { useEffect, useRef, useState } from 'react';

interface Round {
  startTime: number;
  endTime: number;
  winner: string;
  length: number;
}

interface TimeBarProps {
  matchStartTime: number;
  matchEndTime: number;
  matchDurationSeconds: number;
  startIntervalIndex: number;
  endIntervalIndex: number;
  totalIntervals: number;
  rounds?: Round[];
  onRangeChange: (startIndex: number, endIndex: number) => void;
}

export default function TimeBar({
  matchStartTime,
  matchEndTime,
  matchDurationSeconds,
  startIntervalIndex,
  endIntervalIndex,
  totalIntervals,
  rounds = [],
  onRangeChange,
}: TimeBarProps) {
  const [dragging, setDragging] = useState<'start' | 'end' | 'middle' | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, startIdx: 0, endIdx: 0 });
  const barRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTime = startIntervalIndex * 10;
  const endTime = endIntervalIndex * 10;
  const startPercentage = (startIntervalIndex / (totalIntervals - 1)) * 100;
  const endPercentage = (endIntervalIndex / (totalIntervals - 1)) * 100;

  const handleMouseDown = (e: React.MouseEvent, handle: 'start' | 'end' | 'middle') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(handle);
    setDragStartPos({
      x: e.clientX,
      startIdx: startIntervalIndex,
      endIdx: endIntervalIndex,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newInterval = Math.round(percentage * (totalIntervals - 1));

    if (dragging === 'start') {
      const newStart = Math.min(newInterval, endIntervalIndex);
      if (newStart !== startIntervalIndex) {
        onRangeChange(newStart, endIntervalIndex);
      }
    } else if (dragging === 'end') {
      const newEnd = Math.max(newInterval, startIntervalIndex);
      if (newEnd !== endIntervalIndex) {
        onRangeChange(startIntervalIndex, newEnd);
      }
    } else if (dragging === 'middle') {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaPercentage = deltaX / rect.width;
      const deltaIntervals = Math.round(deltaPercentage * (totalIntervals - 1));

      const rangeSize = dragStartPos.endIdx - dragStartPos.startIdx;
      let newStart = dragStartPos.startIdx + deltaIntervals;
      let newEnd = dragStartPos.endIdx + deltaIntervals;

      // Clamp to bounds
      if (newStart < 0) {
        newStart = 0;
        newEnd = rangeSize;
      } else if (newEnd > totalIntervals - 1) {
        newEnd = totalIntervals - 1;
        newStart = newEnd - rangeSize;
      }

      if (newStart !== startIntervalIndex || newEnd !== endIntervalIndex) {
        onRangeChange(newStart, newEnd);
      }
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging || !barRef.current) return;

    // Don't trigger click if clicking on handles
    if ((e.target as HTMLElement).classList.contains('time-handle')) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const clickedInterval = Math.round(percentage * (totalIntervals - 1));

    // Set range to start from beginning to clicked point
    onRangeChange(0, clickedInterval);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, startIntervalIndex, endIntervalIndex, totalIntervals]);

  // Calculate round positions
  const roundMarkers = rounds.map((round) => {
    const roundStart = round.startTime - matchStartTime;
    const roundEnd = round.endTime - matchStartTime;
    const startPercent = (roundStart / matchDurationSeconds) * 100;
    const endPercent = (roundEnd / matchDurationSeconds) * 100;

    return {
      startPercent: Math.max(0, Math.min(100, startPercent)),
      endPercent: Math.max(0, Math.min(100, endPercent)),
      winner: round.winner,
    };
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-warmscale-9/70 backdrop-blur-sm border-t border-warmscale-6 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Time Display */}
        <div className="flex justify-between items-center mb-2">
          <div className="text-warmscale-1 font-mono text-xs">
            <span className="text-orange-400 font-bold">{formatTime(startTime)}</span>
            <span className="text-warmscale-3 mx-1">→</span>
            <span className="text-orange-400 font-bold">{formatTime(endTime)}</span>
            <span className="text-warmscale-4 mx-2">/</span>
            <span className="text-warmscale-2">{formatTime(matchDurationSeconds)}</span>
          </div>
          <div className="text-warmscale-3 text-[10px]">
            {startIntervalIndex === 0 && endIntervalIndex === totalIntervals - 1
              ? 'Full Match'
              : `${formatTime(endTime - startTime)} selected`}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          ref={barRef}
          className="relative h-2 bg-warmscale-8 rounded-sm cursor-pointer group"
          onClick={handleBarClick}
        >
          {/* Selected Range */}
          <div
            className="absolute h-full bg-gradient-to-r from-orange-600 to-orange-500 rounded-sm opacity-70"
            style={{
              left: `${startPercentage}%`,
              width: `${endPercentage - startPercentage}%`,
            }}
            onMouseDown={(e) => handleMouseDown(e, 'middle')}
          />

          {/* Round Markers - Thin vertical lines (rendered above orange) */}
          {roundMarkers.map((marker, idx) => {
            const middlePercent = (marker.startPercent + marker.endPercent) / 2;
            const showLine = marker.startPercent > 0.5; // Don't show line at minute 0
            return (
              <div key={idx}>
                {/* Round Label - Centered in round section */}
                <div
                  className="absolute text-[9px] font-semibold whitespace-nowrap z-10"
                  style={{
                    left: `${middlePercent}%`,
                    transform: 'translateX(-50%)',
                    top: '-16px',
                    color: marker.winner === 'red' ? '#ff6b6b' : marker.winner === 'blue' ? '#74a8d4' : '#888',
                  }}
                >
                  R{idx + 1}
                </div>
                {/* Vertical Line - At round start (skip if at minute 0) */}
                {showLine && (
                  <div
                    className="absolute w-[3px] rounded-full z-10 bg-warmscale-4"
                    style={{
                      left: `${marker.startPercent}%`,
                      transform: 'translateX(-50%)',
                      top: '-4px',
                      height: 'calc(100% + 8px)',
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Start Handle */}
          <div
            className="time-handle absolute w-3 h-3 bg-orange-400 border border-warmscale-9 rounded-sm shadow-md cursor-ew-resize hover:scale-125"
            style={{
              left: `${startPercentage}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              willChange: 'left',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'start')}
          />

          {/* End Handle */}
          <div
            className="time-handle absolute w-3 h-3 bg-orange-400 border border-warmscale-9 rounded-sm shadow-md cursor-ew-resize hover:scale-125"
            style={{
              left: `${endPercentage}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              willChange: 'left',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'end')}
          />
        </div>
      </div>
    </div>
  );
}

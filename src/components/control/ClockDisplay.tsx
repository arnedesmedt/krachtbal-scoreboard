import { useState } from 'react';
import { formatMs } from '../../utils/formatTime';
import { useGameStore } from '../../store/gameStore';

interface ClockDisplayProps {
  showQuitConfirm?: boolean;
  setShowQuitConfirm?: (show: boolean) => void;
}

export function ClockDisplay({ showQuitConfirm = false, setShowQuitConfirm }: ClockDisplayProps) {
  const playedTimeMs = useGameStore((s) => s.playedTimeMs);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const phase = useGameStore((s) => s.phase);
  const toggleClock = useGameStore((s) => s.toggleClock);
  const config = useGameStore((s) => s.config);
  const restMinutesUsedA = useGameStore((s) => s.restMinutesUsedA);
  const restMinutesUsedB = useGameStore((s) => s.restMinutesUsedB);
  const restMinutesUsedReferee = useGameStore((s) => s.restMinutesUsedReferee);

  const isActiveHalf = phase === 'FIRST_HALF' || phase === 'SECOND_HALF';
  const half: 'FIRST_HALF' | 'SECOND_HALF' = phase === 'SECOND_HALF' ? 'SECOND_HALF' : 'FIRST_HALF';
  const baseHalfMs = config ? config.halfTimeLengthMinutes * 60 * 1000 : 0;
  const totalRestMs =
    ((restMinutesUsedA?.[half] ?? 0) +
      (restMinutesUsedB?.[half] ?? 0) +
      (restMinutesUsedReferee?.[half] ?? 0)) *
    60_000;
  const halfTimeLengthMs = baseHalfMs + totalRestMs;
  const remainingMs = Math.max(0, halfTimeLengthMs - playedTimeMs);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6 text-center w-full h-full flex flex-col justify-between">
      {/* Time Display */}
      <div className="relative">
        <div 
          className="font-mono font-black text-slate-800 tracking-wider drop-shadow-lg"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
        >
          {formatMs(playedTimeMs)}
        </div>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 font-mono font-black text-transparent bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl tracking-wider"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}
        >
          {formatMs(playedTimeMs)}
        </div>
      </div>
      
      {/* Remaining Time */}
      {isActiveHalf && halfTimeLengthMs > 0 && (
        <div 
          className="font-mono text-slate-500 mt-2"
          style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}
        >
          -{formatMs(remainingMs)} resterend
        </div>
      )}

      {/* Control Button */}
      <div className="mt-4">
        {clockRunning ? (
          <button
            type="button"
            onClick={() => setShowQuitConfirm?.(true)}
            disabled={!isActiveHalf}
            aria-label="Spel stoppen"
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-50"
            style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
          >
            ⏹ Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleClock}
            disabled={!isActiveHalf}
            aria-label="Klok starten"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-50"
            style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
          >
            ▶ Start
          </button>
        )}
      </div>
    </div>
  );
}


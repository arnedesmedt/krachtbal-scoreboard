import { formatMs } from '../../utils/formatTime';
import { useGameStore } from '../../store/gameStore';

interface ClockDisplayProps {
  onResetClick?: () => void;
  onQuitClick?: () => void;
}

export function ClockDisplay({ onResetClick, onQuitClick }: ClockDisplayProps) {
  
  const playedTimeMs = useGameStore((s) => s.playedTimeMs);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const phase = useGameStore((s) => s.phase);
  const toggleClock = useGameStore((s) => s.toggleClock);
  const startSecondHalf = useGameStore((s) => s.startSecondHalf);
  const startThirdHalf = useGameStore((s) => s.startThirdHalf);
  const startFourthHalf = useGameStore((s) => s.startFourthHalf);
  const startPenaltyShootout = useGameStore((s) => s.startPenaltyShootout);
  const config = useGameStore((s) => s.config);
  const restMinutesUsedA = useGameStore((s) => s.restMinutesUsedA);
  const restMinutesUsedB = useGameStore((s) => s.restMinutesUsedB);
  const restMinutesUsedReferee = useGameStore((s) => s.restMinutesUsedReferee);
  const scoreA = useGameStore((s) => s.scoreA);
  const scoreB = useGameStore((s) => s.scoreB);
  const halvesPlayed = useGameStore((s) => s.halvesPlayed);
  const penaltyShootout = useGameStore((s) => s.penaltyShootout);

  const isActiveHalf = phase === 'FIRST_HALF' || phase === 'SECOND_HALF' || phase === 'THIRD_HALF' || phase === 'FOURTH_HALF';
  
  // Calculate half time length based on phase
  let baseHalfMs: number;
  let half: 'FIRST_HALF' | 'SECOND_HALF' | 'THIRD_HALF' | 'FOURTH_HALF';
  
  if (phase === 'THIRD_HALF' || phase === 'FOURTH_HALF') {
    half = phase;
    baseHalfMs = 5 * 60 * 1000; // 5 minutes for 3rd and 4th halves
  } else {
    half = phase === 'SECOND_HALF' ? 'SECOND_HALF' : 'FIRST_HALF';
    baseHalfMs = config ? config.halfTimeLengthMinutes * 60 * 1000 : 0;
  }
  
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
        {phase === 'HALF_TIME' ? (
          <button
            type="button"
            onClick={startSecondHalf}
            aria-label="Tweede helft starten"
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
            style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
          >
            ⚡ Start tweede helft
          </button>
        ) : phase === 'ENDED' ? (
          (() => {
            if (penaltyShootout) {
              return (
                <button
                  type="button"
                  onClick={onQuitClick}
                  aria-label="Nieuwe wedstrijd starten"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                  style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
                >
                  🏁 Nieuwe wedstrijd
                </button>
              );
            }
            const isScoreEqual = scoreA === scoreB;
            const hasPlayedThirdHalf = halvesPlayed.includes('THIRD_HALF');
            const hasPlayedFourthHalf = halvesPlayed.includes('FOURTH_HALF');
            
            if (isScoreEqual && !hasPlayedThirdHalf) {
              return (
                <button
                  type="button"
                  onClick={startThirdHalf}
                  aria-label="Start derde helft"
                  className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                  style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
                >
                  ⚽ Start 3e helft (5 min)
                </button>
              );
            } else if (hasPlayedThirdHalf && !hasPlayedFourthHalf) {
              // 4th half appears if 3rd half was played but 4th half hasn't been played yet
              return (
                <button
                  type="button"
                  onClick={startFourthHalf}
                  aria-label="Start vierde helft"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                  style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
                >
                  ⚽ Start 4e helft (5 min)
                </button>
              );
            } else {
              // After 4th half: offer shootout if tied, otherwise new game
              if (isScoreEqual) {
                return (
                  <button
                    type="button"
                    onClick={startPenaltyShootout}
                    aria-label="Start vrije worpen"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                    style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
                  >
                    🥅 Start Vrije Worpen
                  </button>
                );
              }
              return (
                <button
                  type="button"
                  onClick={onQuitClick}
                  aria-label="Nieuwe wedstrijd starten"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                  style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
                >
                  🏁 Nieuwe wedstrijd
                </button>
              );
            }
          })()
        ) : (
          <div className="flex gap-2">
            {clockRunning ? (
              <>
                <button
                  type="button"
                  onClick={onResetClick}
                  aria-label="Helft resetten"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                  style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
                >
                  🔄 Reset
                </button>
                <button
                  type="button"
                  onClick={onQuitClick}
                  disabled={!isActiveHalf}
                  aria-label="Spel stoppen"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-50"
                  style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
                >
                  ⏹ Stop
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={toggleClock}
                disabled={!isActiveHalf}
                aria-label="Klok starten"
                className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-50"
                style={{ fontSize: 'clamp(0.875rem, 1.6vw, 1.25rem)' }}
              >
                ▶ Start
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


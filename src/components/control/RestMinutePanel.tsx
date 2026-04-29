import { useGameStore } from '../../store/gameStore';
import { formatMs } from '../../utils/formatTime';

const MAX_TEAM_REST_MINUTES = 2;

export function RestMinutePanel() {
  const restMinute = useGameStore((s) => s.restMinute);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const phase = useGameStore((s) => s.phase);
  const startRestMinute = useGameStore((s) => s.startRestMinute);
  const cancelRestMinute = useGameStore((s) => s.cancelRestMinute);
  const assignRestMinute = useGameStore((s) => s.assignRestMinute);
  const restMinutesUsedA = useGameStore((s) => s.restMinutesUsedA);
  const restMinutesUsedB = useGameStore((s) => s.restMinutesUsedB);
  const restMinutesUsedReferee = useGameStore((s) => s.restMinutesUsedReferee);
  const config = useGameStore((s) => s.config);

  const isActiveHalf = phase === 'FIRST_HALF' || phase === 'SECOND_HALF';
  const half = phase === 'FIRST_HALF' || phase === 'SECOND_HALF' ? phase : 'FIRST_HALF';

  const aUsedThisHalf = restMinutesUsedA[half];
  const bUsedThisHalf = restMinutesUsedB[half];
  const refUsedThisHalf = restMinutesUsedReferee[half];

  const canStart = isActiveHalf && clockRunning && !restMinute;

  const initiatorLabel =
    restMinute?.initiatorTeam === 'A' ? config?.teamA.name ?? 'Team A'
    : restMinute?.initiatorTeam === 'B' ? config?.teamB.name ?? 'Team B'
    : restMinute?.initiatorTeam === 'referee' ? config?.referee ?? 'Scheidsrechter'
    : null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6 w-full text-center h-full flex flex-col justify-between">
      {/* Header */}
      <div className="mb-4">
        <h4 
          className="font-bold text-slate-600 uppercase tracking-wider"
          style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
        >
          Rustminuten
        </h4>
      </div>

      {/* Current Half Stats */}
      <div className="mb-3">
        <div 
          className="font-semibold text-slate-500 uppercase tracking-wide mb-2"
          style={{ fontSize: 'clamp(0.625rem, 1.2vw, 0.875rem)' }}
        >
          Deze helft
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="font-semibold text-slate-700 truncate">{config?.teamA.name ?? 'Team A'}</div>
            <div className="flex items-center justify-center gap-1">
              <span className={aUsedThisHalf >= MAX_TEAM_REST_MINUTES ? 'text-red-500 font-bold' : 'text-slate-600'}>
                {aUsedThisHalf}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">{MAX_TEAM_REST_MINUTES}</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="font-semibold text-slate-700 truncate">{config?.teamB.name ?? 'Team B'}</div>
            <div className="flex items-center justify-center gap-1">
              <span className={bUsedThisHalf >= MAX_TEAM_REST_MINUTES ? 'text-red-500 font-bold' : 'text-slate-600'}>
                {bUsedThisHalf}
              </span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-400">{MAX_TEAM_REST_MINUTES}</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2">
            <div className="font-semibold text-slate-700">Ref</div>
            <div className="text-slate-600">{refUsedThisHalf}</div>
          </div>
        </div>
      </div>

      {/* Total Stats */}
      <div className="mb-4">
        <div 
          className="text-slate-400 text-center"
          style={{ fontSize: 'clamp(0.625rem, 1.1vw, 0.75rem)' }}
        >
          Totaal: A:{restMinutesUsedA.FIRST_HALF + restMinutesUsedA.SECOND_HALF} | 
          B:{restMinutesUsedB.FIRST_HALF + restMinutesUsedB.SECOND_HALF} | 
          Ref:{restMinutesUsedReferee.FIRST_HALF + restMinutesUsedReferee.SECOND_HALF}
        </div>
      </div>

      {/* Active Rest Minute Display */}
      {restMinute && (
        <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200/50">
          <div className="relative">
            <div 
              className="font-mono font-bold text-orange-600 drop-shadow"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}
            >
              {formatMs(restMinute.remainingMs)}
            </div>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 font-mono font-bold text-transparent bg-gradient-to-r from-orange-300/30 to-red-300/30 blur-lg"
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}
            >
              {formatMs(restMinute.remainingMs)}
            </div>
          </div>
          {initiatorLabel !== null ? (
            <div 
              className="font-semibold text-orange-500 mt-2"
              style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
            >
              {initiatorLabel}
            </div>
          ) : (
            <div 
              className="text-slate-400 mt-2 italic"
              style={{ fontSize: 'clamp(0.625rem, 1.2vw, 0.875rem)' }}
            >
              Toewijzen…
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={startRestMinute}
        disabled={!canStart}
        aria-label="Rustminuut starten"
        className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
      >
        Rustminuut starten
      </button>

      </div>
  );
}

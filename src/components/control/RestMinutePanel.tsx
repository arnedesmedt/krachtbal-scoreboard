import { useGameStore } from '../../store/gameStore';
import { formatMs } from '../../utils/formatTime';
import { InitiatorPopup } from './InitiatorPopup';

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
  const showPopup = restMinute !== null && restMinute.initiatorTeam === null;

  const initiatorLabel =
    restMinute?.initiatorTeam === 'A' ? config?.teamA.name ?? 'Team A'
    : restMinute?.initiatorTeam === 'B' ? config?.teamB.name ?? 'Team B'
    : restMinute?.initiatorTeam === 'referee' ? config?.referee ?? 'Scheidsrechter'
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 w-full text-center">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Rustminuten</h4>

      {/* Per-half counters */}
      <div className="flex gap-3 justify-center text-xs text-slate-500 mb-1">
        <span className="font-semibold text-slate-400 uppercase tracking-wide">Deze helft</span>
      </div>
      <div className="flex gap-4 justify-center text-sm text-slate-600 mb-1">
        <span>
          <span className="font-semibold">{config?.teamA.name ?? 'Team A'}:</span>{' '}
          <span className={aUsedThisHalf >= MAX_TEAM_REST_MINUTES ? 'text-red-500 font-bold' : ''}>{aUsedThisHalf}</span>
          <span className="text-slate-400">/{MAX_TEAM_REST_MINUTES}</span>
        </span>
        <span>
          <span className="font-semibold">{config?.teamB.name ?? 'Team B'}:</span>{' '}
          <span className={bUsedThisHalf >= MAX_TEAM_REST_MINUTES ? 'text-red-500 font-bold' : ''}>{bUsedThisHalf}</span>
          <span className="text-slate-400">/{MAX_TEAM_REST_MINUTES}</span>
        </span>
        <span><span className="font-semibold">Ref:</span> {refUsedThisHalf}</span>
      </div>
      {/* Total counters */}
      <div className="flex gap-4 justify-center text-xs text-slate-400 mb-3">
        <span>Totaal A: {restMinutesUsedA.FIRST_HALF + restMinutesUsedA.SECOND_HALF}</span>
        <span>Totaal B: {restMinutesUsedB.FIRST_HALF + restMinutesUsedB.SECOND_HALF}</span>
        <span>Totaal Ref: {restMinutesUsedReferee.FIRST_HALF + restMinutesUsedReferee.SECOND_HALF}</span>
      </div>

      {restMinute && (
        <div className="mb-3">
          <div className="text-3xl font-mono font-bold text-orange-600">
            {formatMs(restMinute.remainingMs)}
          </div>
          {initiatorLabel !== null ? (
            <div className="text-sm font-semibold text-orange-500 mt-1">{initiatorLabel}</div>
          ) : (
            <div className="text-sm text-slate-400 mt-1 italic">Toewijzen…</div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={startRestMinute}
        disabled={!canStart}
        aria-label="Rustminuut starten"
        className="px-5 py-2 bg-orange-100 hover:bg-orange-200 disabled:opacity-40 disabled:cursor-not-allowed text-orange-800 font-semibold rounded-xl transition-colors text-sm"
      >
        Rustminuut starten
      </button>

      {showPopup && (
        <InitiatorPopup
          teamAName={config?.teamA.name ?? 'Team A'}
          teamBName={config?.teamB.name ?? 'Team B'}
          refereeName={config?.referee ?? 'Scheidsrechter'}
          onSelect={assignRestMinute}
          onCancel={cancelRestMinute}
          disabledA={aUsedThisHalf >= MAX_TEAM_REST_MINUTES}
          disabledB={bUsedThisHalf >= MAX_TEAM_REST_MINUTES}
        />
      )}
    </div>
  );
}

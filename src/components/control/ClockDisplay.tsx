import { useState } from 'react';
import { formatMs } from '../../utils/formatTime';
import { useGameStore } from '../../store/gameStore';

export function ClockDisplay() {
  const [showConfirm, setShowConfirm] = useState(false);
  const playedTimeMs = useGameStore((s) => s.playedTimeMs);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const phase = useGameStore((s) => s.phase);
  const toggleClock = useGameStore((s) => s.toggleClock);
  const abandonGame = useGameStore((s) => s.abandonGame);
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

  const handleStopConfirmed = () => {
    setShowConfirm(false);
    abandonGame();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center w-full">
      <div className="text-5xl font-mono font-black text-slate-800 mb-1 tracking-widest">
        {formatMs(playedTimeMs)}
      </div>
      {isActiveHalf && halfTimeLengthMs > 0 && (
        <div className="text-sm font-mono text-slate-400 mb-3">
          -{formatMs(remainingMs)} resterend
        </div>
      )}

      {clockRunning ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={!isActiveHalf}
          aria-label="Spel stoppen"
          className="px-8 py-2 rounded-xl font-bold text-base transition-colors bg-red-100 hover:bg-red-200 text-red-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⏹ Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleClock}
          disabled={!isActiveHalf}
          aria-label="Klok starten"
          className="px-8 py-2 rounded-xl font-bold text-base transition-colors bg-blue-100 hover:bg-blue-200 text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ▶ Start
        </button>
      )}

      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '2rem', minWidth: '288px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#1e293b' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>Wedstrijd stoppen?</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>De wedstrijd wordt gestopt en je keert terug naar het configuratiescherm.</p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', color: '#334155', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleStopConfirmed}
                style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                Ja, stoppen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


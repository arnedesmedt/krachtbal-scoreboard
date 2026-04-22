import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useGameTimer } from '../../hooks/useGameTimer';
import { useBuzzer } from '../../hooks/useBuzzer';
import { setupSyncListener } from '../../store/syncListener';
import { ConfigWindow } from '../config/ConfigWindow';
import { ClockDisplay } from './ClockDisplay';
import { ScorePanel } from './ScorePanel';
import { RestMinutePanel } from './RestMinutePanel';
import { HalfTimePanel } from './HalfTimePanel';
import { EndGamePanel } from './EndGamePanel';
import { phaseLabel } from '../../utils/gamePhaseLabel';

export default function ControlWindow() {
  const phase = useGameStore((s) => s.phase);
  const league = useGameStore((s) => s.config?.league);
  const openSinglePresentationWindow = useGameStore((s) => s.openSinglePresentationWindow);
  useBuzzer();
  useGameTimer();

  useEffect(() => {
    setupSyncListener().catch(console.error);
  }, []);

  if (phase === 'SETUP') {
    return <ConfigWindow />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center">
            {league && (
              <div className="text-base font-bold text-slate-700 uppercase tracking-widest mb-1">{league}</div>
            )}
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full">
              {phaseLabel(phase)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openSinglePresentationWindow()}
            title="Presentatiescherm openen"
            className="ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
          >
            🖥️ Scherm openen
          </button>
        </div>

        <HalfTimePanel />
        <EndGamePanel />

        <div className="grid grid-cols-3 gap-4">
          {/* Left: Team A */}
          <ScorePanel team="A" />

          {/* Center: Clock + Rest Minute */}
          <div className="flex flex-col items-center space-y-4">
            <ClockDisplay />
            <RestMinutePanel />
          </div>

          {/* Right: Team B */}
          <ScorePanel team="B" />
        </div>
      </div>
    </div>
  );
}

import { useGameStore } from '../../store/gameStore';
import type { PenaltyBulletState } from '../../types/game';

interface PenaltyBulletProps {
  state: PenaltyBulletState;
  onScored: () => void;
  onMissed: () => void;
  disabled: boolean;
}

function PenaltyBullet({ state, onScored, onMissed, disabled }: PenaltyBulletProps) {
  const getColor = () => {
    switch (state) {
      case 'scored': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full transition-colors duration-300 ${getColor()}`}
      />
      {state === 'pending' && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onScored}
            disabled={disabled}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
          >
            ✓
          </button>
          <button
            type="button"
            onClick={onMissed}
            disabled={disabled}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-xs rounded transition-colors"
          >
            ✗
          </button>
        </div>
      )}
    </div>
  );
}

export function PenaltyShootoutPanel() {
  const penaltyShootout = useGameStore((s) => s.penaltyShootout);
  const config = useGameStore((s) => s.config);
  const setPenaltyBullet = useGameStore((s) => s.setPenaltyBullet);
  const nextPenaltyRound = useGameStore((s) => s.nextPenaltyRound);

  if (!penaltyShootout) return null;

  const { bulletsA, bulletsB, currentRound, suddenDeath } = penaltyShootout;
  const scoredA = bulletsA.filter(b => b === 'scored').length;
  const scoredB = bulletsB.filter(b => b === 'scored').length;

  const handleBulletClick = (team: 'A' | 'B', roundIndex: number, state: PenaltyBulletState) => {
    setPenaltyBullet(team, roundIndex, state);
  };

  const canAdvanceRound = () => {
    const currentRoundA = bulletsA[currentRound - 1];
    const currentRoundB = bulletsB[currentRound - 1];
    return currentRoundA !== 'pending' && currentRoundB !== 'pending';
  };

  const isComplete = () => {
    if (suddenDeath) {
      return currentRound > 4 && canAdvanceRound();
    }
    return currentRound >= 4 && canAdvanceRound();
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6 w-full">
      <div className="text-center mb-6">
        <h4 className="font-bold text-slate-600 uppercase tracking-wider mb-2">
          {suddenDeath ? 'Sudden Death' : 'Vrije Worpen'}
        </h4>
        <div className="text-2xl font-bold text-slate-800">
          {scoredA} - {scoredB}
        </div>
        <div className="text-sm text-slate-500">
          Ronde {currentRound}{suddenDeath ? ' (Sudden Death)' : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        {/* Team A Bullets */}
        <div>
          <div className="text-center font-semibold text-slate-700 mb-3">
            {config?.teamA.name || 'Team A'}
          </div>
          <div className="flex justify-center gap-2">
            {bulletsA.map((bullet, index) => (
              <PenaltyBullet
                key={index}
                state={bullet}
                onScored={() => handleBulletClick('A', index, 'scored')}
                onMissed={() => handleBulletClick('A', index, 'missed')}
                disabled={index !== currentRound - 1}
              />
            ))}
          </div>
        </div>

        {/* Team B Bullets */}
        <div>
          <div className="text-center font-semibold text-slate-700 mb-3">
            {config?.teamB.name || 'Team B'}
          </div>
          <div className="flex justify-center gap-2">
            {bulletsB.map((bullet, index) => (
              <PenaltyBullet
                key={index}
                state={bullet}
                onScored={() => handleBulletClick('B', index, 'scored')}
                onMissed={() => handleBulletClick('B', index, 'missed')}
                disabled={index !== currentRound - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        {canAdvanceRound() && !isComplete() && (
          <button
            type="button"
            onClick={nextPenaltyRound}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Volgende Ronde
          </button>
        )}
        {isComplete() && (
          <div className="text-center">
            <div className="text-lg font-bold text-slate-800 mb-2">
              {scoredA > scoredB ? config?.teamA.name : scoredB > scoredA ? config?.teamB.name : 'Gelijkspel'} wint!
            </div>
            <div className="text-sm text-slate-500">
              Druk op "Nieuwe Wedstrijd" om opnieuw te beginnen
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useGameStore } from '../../store/gameStore';

export function EndGamePanel() {
  const phase = useGameStore((s) => s.phase);
  const resetGame = useGameStore((s) => s.resetGame);
  const startThirdHalf = useGameStore((s) => s.startThirdHalf);
  const startFourthHalf = useGameStore((s) => s.startFourthHalf);
  const scoreA = useGameStore((s) => s.scoreA);
  const scoreB = useGameStore((s) => s.scoreB);
  const config = useGameStore((s) => s.config);
  const halvesPlayed = useGameStore((s) => s.halvesPlayed);

  if (phase !== 'ENDED') return null;

  const isScoreEqual = scoreA === scoreB;
  
  // Determine which button to show
  let actionButton = null;
  let message = '';

  if (isScoreEqual) {
    const hasPlayedThirdHalf = halvesPlayed.includes('THIRD_HALF');
    
    if (!hasPlayedThirdHalf) {
      actionButton = (
        <button
          type="button"
          onClick={startThirdHalf}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg shadow transition-colors"
        >
          ⚽ Start 3e helft (5 min)
        </button>
      );
      message = 'De stand is gelijk! Start de 3e helft.';
    } else {
      actionButton = (
        <button
          type="button"
          onClick={startFourthHalf}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition-colors"
        >
          ⚽ Start 4e helft (5 min)
        </button>
      );
      message = 'Start de 4e helft.';
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-4">
      <h2 className="text-2xl font-bold text-green-800 mb-2">Wedstrijd afgelopen!</h2>
      <div className="text-lg text-slate-700 mb-4">
        Eindstand: <span className="font-bold">{scoreA}</span> - <span className="font-bold">{scoreB}</span>
        {config && (
          <span className="block text-sm text-slate-500 mt-1">
            {config.teamA.name} vs {config.teamB.name}
          </span>
        )}
      </div>
      
      {message && (
        <div className="text-lg font-semibold text-slate-700 mb-4">
          {message}
        </div>
      )}
      
      <div className="flex gap-4 justify-center">
        {actionButton}
        <button
          type="button"
          onClick={resetGame}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors"
        >
          📋 Selecteer nieuwe wedstrijd
        </button>
      </div>
    </div>
  );
}

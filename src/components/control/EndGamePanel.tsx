import { useGameStore } from '../../store/gameStore';

export function EndGamePanel() {
  const phase = useGameStore((s) => s.phase);
  const resetGame = useGameStore((s) => s.resetGame);
  const scoreA = useGameStore((s) => s.scoreA);
  const scoreB = useGameStore((s) => s.scoreB);
  const config = useGameStore((s) => s.config);

  if (phase !== 'ENDED') return null;

  const isScoreEqual = scoreA === scoreB;
  
  // Only show new game button when scores are NOT equal
  // When scores are equal, the 3rd/4th half button is shown in the ClockDisplay
  if (isScoreEqual) {
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
        <div className="text-lg font-semibold text-slate-700 mb-4">
          De stand is gelijk! Gebruik de knop in de timer om de volgende helft te starten.
        </div>
      </div>
    );
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
      
      <div className="flex gap-4 justify-center">
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

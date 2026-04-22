import { useGameStore } from '../../store/gameStore';

export function EndGamePanel() {
  const phase = useGameStore((s) => s.phase);
  const resetGame = useGameStore((s) => s.resetGame);

  if (phase !== 'ENDED') return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-4">
      <h2 className="text-2xl font-bold text-red-800 mb-4">Wedstrijd afgelopen</h2>
      <button
        type="button"
        onClick={resetGame}
        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow transition-colors"
      >
        Nieuwe wedstrijd
      </button>
    </div>
  );
}

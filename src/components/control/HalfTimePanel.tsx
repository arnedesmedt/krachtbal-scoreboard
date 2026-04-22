import { useGameStore } from '../../store/gameStore';

export function HalfTimePanel() {
  const phase = useGameStore((s) => s.phase);
  const startSecondHalf = useGameStore((s) => s.startSecondHalf);

  if (phase !== 'HALF_TIME') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center mb-4">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Rust</h2>
      <button
        type="button"
        onClick={startSecondHalf}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-colors"
      >
        Start tweede helft
      </button>
    </div>
  );
}

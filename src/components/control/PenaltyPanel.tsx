import { useGameStore } from '../../store/gameStore';

interface PenaltyPanelProps {
  team: 'A' | 'B';
}

export function PenaltyPanel({ team }: PenaltyPanelProps) {
  const teamAPlayers = useGameStore((s) => s.teamAPlayers);
  const teamBPlayers = useGameStore((s) => s.teamBPlayers);
  const addPenalty = useGameStore((s) => s.addPenalty);
  const resetPenalty = useGameStore((s) => s.resetPenalty);

  const players = team === 'A' ? teamAPlayers : teamBPlayers;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Straffen</h4>
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.number} className="flex items-center gap-2 text-sm">
            <span className="w-6 text-slate-400 font-mono">{player.number}</span>
            <span className="flex-1 text-slate-700 truncate">{player.name}</span>
            <span className="w-8 text-center font-bold text-orange-600">{player.penalties}</span>
            <button
              type="button"
              onClick={() => addPenalty(team, player.number)}
              aria-label={`Add penalty player ${player.number}`}
              className="px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded font-bold transition-colors"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => resetPenalty(team, player.number)}
              disabled={player.penalties <= 0}
              aria-label={`Reset penalty player ${player.number}`}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-600 rounded font-bold transition-colors"
            >
              −
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

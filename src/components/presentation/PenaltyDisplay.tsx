import type { GameStateUpdatePayload } from '../../types/game';

interface PenaltyDisplayProps {
  payload: GameStateUpdatePayload;
}

function PenaltyRow({ number, name, penalties }: { number: number; name: string; penalties: number }) {
  return (
    <div className="flex gap-3 py-1 text-sm border-b border-gray-800 last:border-0">
      <span className="w-6 text-gray-500 font-mono">{number}</span>
      <span className="flex-1 text-gray-200">{name}</span>
      <span className="text-red-400 font-bold tracking-widest">{'X'.repeat(penalties)}</span>
    </div>
  );
}

export function PenaltyDisplay({ payload }: PenaltyDisplayProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <div className="flex gap-8">
        <div className="flex-1">
          <h3 className="font-bold text-base mb-2" style={{ color: payload.teamA.color }}>{payload.teamA.name}</h3>
          {payload.teamA.players.map((p) => (
            <PenaltyRow key={p.number} number={p.number} name={p.name} penalties={p.penalties} />
          ))}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-base mb-2" style={{ color: payload.teamB.color }}>{payload.teamB.name}</h3>
          {payload.teamB.players.map((p) => (
            <PenaltyRow key={p.number} number={p.number} name={p.name} penalties={p.penalties} />
          ))}
        </div>
      </div>
    </div>
  );
}

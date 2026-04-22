import type { GameStateUpdatePayload } from '../../types/game';

interface PenaltyDisplayProps {
  payload: GameStateUpdatePayload;
}

const MAX_PENALTIES = 3;

function PenaltyXs({ count }: { count: number; color?: string }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span key={i} style={{ fontSize: '2vw', color: i < count ? '#ef4444' : 'rgba(255,255,255,0.15)', fontWeight: 900 }}>✕</span>
      ))}
    </div>
  );
}

export function PenaltyDisplay({ payload }: PenaltyDisplayProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <div className="flex gap-8 justify-center">
        <div className="flex-1 text-center">
          <h3 className="font-bold text-base mb-2" style={{ color: payload.teamA.color }}>{payload.teamA.name}</h3>
          <PenaltyXs count={payload.penaltiesA} color={payload.teamA.color} />
        </div>
        <div className="flex-1 text-center">
          <h3 className="font-bold text-base mb-2" style={{ color: payload.teamB.color }}>{payload.teamB.name}</h3>
          <PenaltyXs count={payload.penaltiesB} color={payload.teamB.color} />
        </div>
      </div>
    </div>
  );
}

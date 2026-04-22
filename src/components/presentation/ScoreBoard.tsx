import { phaseLabel } from '../../utils/gamePhaseLabel';
import type { GameStateUpdatePayload } from '../../types/game';

const MAX_PENALTIES = 3;

interface ScoreBoardProps {
  payload: GameStateUpdatePayload;
}

function PenaltyXs({ count, size }: { count: number; size: string }) {
  return (
    <div className="flex gap-[0.4vw] justify-center mt-[0.5vh]">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < count ? '#ef4444' : 'rgba(255,255,255,0.15)', fontWeight: 900 }}>
          ✕
        </span>
      ))}
    </div>
  );
}

export function ScoreBoard({ payload }: ScoreBoardProps) {
  const header = [payload.league, phaseLabel(payload.phase)].filter(Boolean).join(' — ');
  return (
    <div className="text-center">
      {header && (
        <div className="font-bold uppercase tracking-widest mb-[3vh] text-gray-400" style={{ fontSize: '2.5vw' }}>
          {header}
        </div>
      )}
      <div className="grid mb-[2vh]" style={{ gridTemplateColumns: '1fr auto 1fr', rowGap: '0' }}>
        {/* Row 1: badges + vs */}
        <div className="flex items-center justify-center">
          <div
            className="font-bold text-white rounded-2xl"
            style={{ backgroundColor: payload.teamA.color, fontSize: '3.5vw', padding: '1vh 2vw' }}
          >
            {payload.teamA.name}
          </div>
        </div>
        <div className="flex items-center justify-center font-semibold uppercase tracking-widest text-gray-400" style={{ fontSize: '2vw', padding: '0 2vw' }}>vs</div>
        <div className="flex items-center justify-center">
          <div
            className="font-bold text-white rounded-2xl"
            style={{ backgroundColor: payload.teamB.color, fontSize: '3.5vw', padding: '1vh 2vw' }}
          >
            {payload.teamB.name}
          </div>
        </div>
        {/* Row 2: penalty X's + referee centered under vs */}
        <div className="flex justify-center"><PenaltyXs count={payload.penaltiesA} size="3vw" /></div>
        <div className="flex items-center justify-center text-gray-400" style={{ fontSize: '1.5vw', padding: '0 1vw' }}>
          {payload.referee ? `Scheidsrechter: ${payload.referee}` : ''}
        </div>
        <div className="flex justify-center"><PenaltyXs count={payload.penaltiesB} size="3vw" /></div>
      </div>
      <div className="flex items-center justify-center leading-none" style={{ fontSize: '14vw', gap: '2vw' }}>
        <span className="font-black text-white tabular-nums text-right" style={{ minWidth: '16vw' }}>
          {payload.scoreA}
        </span>
        <span className="font-black text-white" style={{ fontSize: '8vw' }}>–</span>
        <span className="font-black text-white tabular-nums text-left" style={{ minWidth: '16vw' }}>
          {payload.scoreB}
        </span>
      </div>
    </div>
  );
}


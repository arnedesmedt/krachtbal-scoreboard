import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface TimerDisplayProps {
  payload: GameStateUpdatePayload;
}

export function TimerDisplay({ payload }: TimerDisplayProps) {
  return (
    <div className="text-center">
      <div className="font-mono font-black text-white tracking-widest leading-none" style={{ fontSize: '8vw' }}>
        {formatMs(payload.playedTimeMs)}
      </div>
    </div>
  );
}

import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface TimerDisplayProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

export function TimerDisplay({ payload, theme = 'light' }: TimerDisplayProps) {
  return (
    <div className="text-center">
      <div
        className={`font-mono font-black tracking-widest leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
        style={{ fontSize: '8vw' }}
      >
        {formatMs(payload.playedTimeMs)}
      </div>
    </div>
  );
}

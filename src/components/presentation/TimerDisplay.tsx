import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface TimerDisplayProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

export function TimerDisplay({ payload, theme = 'light' }: TimerDisplayProps) {
  const isDark = theme === 'dark';
  const cardBg = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-sm'
    : 'bg-white/70 border-white/20 backdrop-blur-sm';

  return (
    <div
      className={`rounded-2xl border shadow-xl ${cardBg}`}
      style={{ padding: '2vh 4vw' }}
    >
      <div className="flex items-center justify-center" style={{ gap: '1.5vw' }}>
        <div
          className={`rounded-full flex-shrink-0 transition-all duration-500 ${
            payload.clockRunning
              ? 'bg-green-500 shadow-lg animate-pulse'
              : isDark ? 'bg-white/20' : 'bg-gray-300'
          }`}
          style={{ width: 'max(10px, 1.2vw)', height: 'max(10px, 1.2vw)' }}
        />
        <div
          className={`font-mono font-black tracking-widest leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: '8vw' }}
        >
          {formatMs(payload.playedTimeMs)}
        </div>
      </div>
    </div>
  );
}

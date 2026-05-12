import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface RestMinuteDisplayProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

export function RestMinuteDisplay({ payload, theme = 'light' }: RestMinuteDisplayProps) {
  if (!payload.restMinute) return null;

  const isDark = theme === 'dark';
  const { initiatorTeam } = payload.restMinute;
  const teamLabel =
    initiatorTeam === 'A'
      ? payload.teamA.name
      : initiatorTeam === 'B'
      ? payload.teamB.name
      : initiatorTeam === 'referee'
      ? 'Scheidsrechter'
      : null;

  const cardBg = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-sm'
    : 'bg-white/70 border-white/20 backdrop-blur-sm';

  return (
    <div className="flex flex-col items-center" style={{ gap: '2vh' }}>
      {/* Rest minute countdown */}
      <div
        className="rounded-2xl shadow-xl overflow-hidden"
        style={{ minWidth: 'clamp(200px, 30vw, 480px)' }}
      >
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-center" style={{ padding: '2vh 3vw' }}>
          <div
            className="font-bold text-white/80 uppercase tracking-widest"
            style={{ fontSize: 'clamp(0.6rem, 1.5vw, 1rem)', marginBottom: '0.5vh' }}
          >
            RUSTMINUUT{teamLabel ? ` — ${teamLabel}` : ''}
          </div>
          <div className="font-mono font-black text-white" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
            {formatMs(payload.restMinute.remainingMs)}
          </div>
        </div>
      </div>

      {/* Total time */}
      <div
        className={`rounded-2xl border shadow-xl text-center ${cardBg}`}
        style={{ padding: '1.5vh 3vw', minWidth: 'clamp(200px, 30vw, 480px)' }}
      >
        <div
          className={`font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: 'clamp(0.5rem, 1.2vw, 0.8rem)', marginBottom: '0.4vh' }}
        >
          TOTALE TIJD
        </div>
        <div
          className={`font-mono font-black tracking-widest leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}
        >
          {formatMs(payload.playedTimeMs)}
        </div>
      </div>
    </div>
  );
}

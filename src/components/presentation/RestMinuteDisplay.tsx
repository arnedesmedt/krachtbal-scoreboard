import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface RestMinuteDisplayProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

export function RestMinuteDisplay({ payload, theme = 'light' }: RestMinuteDisplayProps) {
  if (!payload.restMinute) return null;

  const { initiatorTeam } = payload.restMinute;
  const teamLabel =
    initiatorTeam === 'A'
      ? ` — ${payload.teamA.name}`
      : initiatorTeam === 'B'
      ? ` — ${payload.teamB.name}`
      : initiatorTeam === 'referee'
      ? ` — ${payload.referee}`
      : '';

  return (
    <div className="flex flex-col items-center gap-[2vh]">
      {/* Rest minute countdown */}
      <div className="bg-orange-500 rounded-2xl text-center" style={{ padding: '1.5vh 3vw' }}>
        <div className="font-bold text-white uppercase tracking-wide" style={{ fontSize: '2.5vw', marginBottom: '0.5vh' }}>
          RUSTMINUUT{teamLabel}
        </div>
        <div className="font-mono font-black text-white" style={{ fontSize: '6vw' }}>
          {formatMs(payload.restMinute.remainingMs)}
        </div>
      </div>
      
      {/* Total time */}
      <div className="text-center">
        <div className="font-bold uppercase tracking-wide text-gray-500" style={{ fontSize: '1.5vw', marginBottom: '0.5vh' }}>
          TOTALE TIJD
        </div>
        <div
          className={`font-mono font-black tracking-widest leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: '4vw' }}
        >
          {formatMs(payload.playedTimeMs)}
        </div>
      </div>
    </div>
  );
}

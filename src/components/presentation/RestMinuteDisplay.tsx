import { formatMs } from '../../utils/formatTime';
import type { GameStateUpdatePayload } from '../../types/game';

interface RestMinuteDisplayProps {
  payload: GameStateUpdatePayload;
}

export function RestMinuteDisplay({ payload }: RestMinuteDisplayProps) {
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
    <div className="bg-orange-500 rounded-2xl text-center" style={{ padding: '2vh 4vw' }}>
      <div className="font-bold text-white uppercase tracking-wide" style={{ fontSize: '3vw', marginBottom: '1vh' }}>
        RUSTMINUUT{teamLabel}
      </div>
      <div className="font-mono font-black text-white" style={{ fontSize: '8vw' }}>
        {formatMs(payload.restMinute.remainingMs)}
      </div>
    </div>
  );
}

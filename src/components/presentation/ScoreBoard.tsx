import { phaseLabel } from '../../utils/gamePhaseLabel';
import type { GameStateUpdatePayload } from '../../types/game';

const MAX_PENALTIES = 3;

interface ScoreBoardProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

function PenaltyXs({ count, size, theme = 'light' }: { count: number; size: string; theme?: 'light' | 'dark' }) {
  return (
    <div className="flex gap-[0.4vw] justify-center mt-[0.5vh]">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < count ? '#ef4444' : theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)', fontWeight: 900 }}>
          ✕
        </span>
      ))}
    </div>
  );
}

function RestMinuteIcons({ firstHalf, secondHalf, theme = 'light' }: { firstHalf: number; secondHalf: number; theme?: 'light' | 'dark' }) {
  const takenColor = '#22c55e'; // green-500
  const emptyColor = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const dividerColor = theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
  const MAX_PER_HALF = 2;
  const dotSize = '1.4vw';
  return (
    <div className="flex gap-[0.4vw] justify-center items-center mt-[0.6vh]">
      {Array.from({ length: MAX_PER_HALF }).map((_, i) => (
        <span
          key={`f${i}`}
          style={{
            display: 'inline-block',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: i < firstHalf ? takenColor : emptyColor,
          }}
        />
      ))}
      <span style={{ fontSize: '1.6vw', color: dividerColor, margin: '0 0.3vw', lineHeight: 1 }}>|</span>
      {Array.from({ length: MAX_PER_HALF }).map((_, i) => (
        <span
          key={`s${i}`}
          style={{
            display: 'inline-block',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: i < secondHalf ? takenColor : emptyColor,
          }}
        />
      ))}
    </div>
  );
}

export function ScoreBoard({ payload, theme = 'light' }: ScoreBoardProps) {
  const header = [payload.league, phaseLabel(payload.phase)].filter(Boolean).join(' — ');
  const textMuted = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  const textScore = theme === 'dark' ? 'text-white' : 'text-gray-900';
  return (
    <div className="text-center">
      {header && (
        <div className={`font-bold uppercase tracking-widest mb-[3vh] ${textMuted}`} style={{ fontSize: '2.5vw' }}>
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
        <div className={`flex items-center justify-center font-semibold uppercase tracking-widest ${textMuted}`} style={{ fontSize: '2vw', padding: '0 2vw' }}>vs</div>
        <div className="flex items-center justify-center">
          <div
            className="font-bold text-white rounded-2xl"
            style={{ backgroundColor: payload.teamB.color, fontSize: '3.5vw', padding: '1vh 2vw' }}
          >
            {payload.teamB.name}
          </div>
        </div>
        {/* Row 2: penalty X's + referee centered under vs */}
        <div className="flex flex-col items-center">
          <PenaltyXs count={payload.penaltiesA} size="3vw" theme={theme} />
          <RestMinuteIcons firstHalf={payload.restMinutesUsedA.FIRST_HALF} secondHalf={payload.restMinutesUsedA.SECOND_HALF} theme={theme} />
        </div>
        <div className={`flex flex-col items-center justify-center ${textMuted}`} style={{ fontSize: '1.5vw', padding: '0 1vw' }}>
          {payload.referee ? <span>{`Scheidsrechter: ${payload.referee}`}</span> : ''}
        </div>
        <div className="flex flex-col items-center">
          <PenaltyXs count={payload.penaltiesB} size="3vw" theme={theme} />
          <RestMinuteIcons firstHalf={payload.restMinutesUsedB.FIRST_HALF} secondHalf={payload.restMinutesUsedB.SECOND_HALF} theme={theme} />
        </div>
      </div>
      <div className="flex items-center justify-center leading-none" style={{ fontSize: '14vw', gap: '2vw' }}>
        <span className={`font-black tabular-nums text-right ${textScore}`} style={{ minWidth: '16vw' }}>
          {payload.scoreA}
        </span>
        <span className={`font-black ${textScore}`} style={{ fontSize: '8vw' }}>–</span>
        <span className={`font-black tabular-nums text-left ${textScore}`} style={{ minWidth: '16vw' }}>
          {payload.scoreB}
        </span>
      </div>
    </div>
  );
}

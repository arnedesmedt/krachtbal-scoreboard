import { useRef, useState, useEffect } from 'react';
import type { GameStateUpdatePayload } from '../../types/game';

const MAX_PENALTIES = 3;

interface ScoreBoardProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

function AnimatedScore({ score, theme }: { score: number; theme: 'light' | 'dark' }) {
  const prevScore = useRef(score);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prevScore.current !== score) {
      setAnimKey(k => k + 1);
      prevScore.current = score;
    }
  }, [score]);

  return (
    <span
      key={animKey}
      className={`font-black tabular-nums leading-none inline-block ${animKey > 0 ? 'animate-score-bump' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
      style={{ fontSize: 'clamp(5rem, 20vw, 18rem)' }}
    >
      {score}
    </span>
  );
}

function PenaltyXs({ count, size, theme = 'light' }: { count: number; size: string; theme?: 'light' | 'dark' }) {
  const prevCount = useRef(count);
  const [newIndex, setNewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (count > prevCount.current) {
      setNewIndex(count - 1);
      const t = setTimeout(() => setNewIndex(null), 500);
      prevCount.current = count;
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  return (
    <div className="flex gap-[0.4vw]">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: size,
            color: i < count ? '#ef4444' : theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
            fontWeight: 900,
            display: 'inline-block',
          }}
          className={i === newIndex ? 'animate-penalty-pop' : ''}
        >
          ✕
        </span>
      ))}
    </div>
  );
}

function RestMinuteIcons({ currentHalf, theme = 'light' }: { currentHalf: number; theme?: 'light' | 'dark' }) {
  const takenColor = '#3b82f6';
  const emptyColor = theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
  return (
    <div className="flex gap-[0.4vw] items-center">
      {Array.from({ length: 2 }).map((_, i) => (
        <span
          key={`rest${i}`}
          style={{ fontSize: 'clamp(1.8rem, 5vw, 4.5rem)', color: i < currentHalf ? takenColor : emptyColor, lineHeight: 1 }}
        >
          ⏱
        </span>
      ))}
    </div>
  );
}

function PenaltyBulletRow({
  bullets,
  currentRound,
  theme = 'light',
  bulletSize = 'clamp(10px, 1.8vw, 22px)',
}: {
  bullets: import('../../types/game').PenaltyBulletState[];
  currentRound: number;
  theme?: 'light' | 'dark';
  bulletSize?: string;
}) {
  const getBulletColor = (state: import('../../types/game').PenaltyBulletState) => {
    if (state === 'scored') return theme === 'dark' ? '#10b981' : '#059669';
    if (state === 'missed') return theme === 'dark' ? '#ef4444' : '#dc2626';
    return theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
  };

  return (
    <div className="flex gap-[0.6vw] items-center flex-wrap">
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className={`rounded-full border-2 transition-all duration-300 ${
            index === currentRound - 1 && bullet === 'pending' ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
          }`}
          style={{
            width: bulletSize,
            height: bulletSize,
            backgroundColor: getBulletColor(bullet),
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
          }}
        />
      ))}
    </div>
  );
}

export function ScoreBoard({ payload, theme = 'light' }: ScoreBoardProps) {
  const isDark = theme === 'dark';
  const isPenaltyShootout = payload.penaltyShootout !== null;
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark
    ? 'bg-white/5 border-white/10 backdrop-blur-sm'
    : 'bg-white/80 border-white/30 backdrop-blur-sm';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const restHalf: keyof typeof payload.restMinutesUsedA =
    payload.phase === 'SECOND_HALF' ? 'SECOND_HALF' : 'FIRST_HALF';

  return (
    <div className="w-full">
      {/* Unified scoreboard card */}
      <div className={`rounded-3xl border shadow-2xl overflow-hidden ${cardBg}`}>

        {/* Team name header — split left/right with each team's color */}
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div
            className="font-bold text-white"
            style={{
              backgroundColor: payload.teamA.color,
              fontSize: 'clamp(1.5rem, 3.8vw, 3.5rem)',
              padding: 'clamp(1rem, 2.5vh, 2rem) clamp(1.5rem, 3.5vw, 3rem)',
            }}
          >
            {payload.teamA.name}
          </div>
          <div
            className="font-bold text-white text-right"
            style={{
              backgroundColor: payload.teamB.color,
              fontSize: 'clamp(1.5rem, 3.8vw, 3.5rem)',
              padding: 'clamp(1rem, 2.5vh, 2rem) clamp(1.5rem, 3.5vw, 3rem)',
            }}
          >
            {payload.teamB.name}
          </div>
        </div>

        {/* Penalty shootout: round number row */}
        {isPenaltyShootout && payload.penaltyShootout && (
          <div
            className={`flex items-center justify-center gap-[2vw] ${textMuted}`}
            style={{ borderBottom: `1px solid ${divider}`, padding: 'clamp(0.75rem, 2vh, 1.5rem) clamp(1rem, 3vw, 2.5rem)' }}
          >
            <span
              className={`font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: 'clamp(1.8rem, 4.5vw, 4rem)' }}
            >
              Ronde {payload.penaltyShootout.currentRound}
            </span>
            {payload.penaltyShootout.suddenDeath && (
              <span
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.8rem)', padding: '0.5vh 1.8vw' }}
              >
                Sudden Death
              </span>
            )}
          </div>
        )}

        {/* Score row */}
        {isPenaltyShootout && payload.penaltyShootout ? (
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: '1fr auto 1fr',
              padding: 'clamp(1rem, 3vh, 2.5rem) clamp(1rem, 3vw, 2.5rem)',
              gap: 'clamp(2rem, 8vw, 8rem)',
            }}
          >
            <div className="flex items-center justify-end">
              <PenaltyBulletRow
                bullets={payload.penaltyShootout.bulletsA}
                currentRound={payload.penaltyShootout.currentRound}
                theme={theme}
                bulletSize="clamp(20px, 4.5vw, 60px)"
              />
            </div>
            <div className="flex items-center justify-center" style={{ gap: 'clamp(0.75rem, 3vw, 3rem)' }}>
              <AnimatedScore score={payload.scoreA} theme={theme} />
              <span
                className={`font-black leading-none select-none ${isDark ? 'text-white/25' : 'text-gray-300'}`}
                style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}
              >
                —
              </span>
              <AnimatedScore score={payload.scoreB} theme={theme} />
            </div>
            <div className="flex items-center justify-start">
              <PenaltyBulletRow
                bullets={payload.penaltyShootout.bulletsB}
                currentRound={payload.penaltyShootout.currentRound}
                theme={theme}
                bulletSize="clamp(20px, 4.5vw, 60px)"
              />
            </div>
          </div>
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ padding: 'clamp(2rem, 6vh, 5rem) clamp(2rem, 7vw, 6rem)', gap: 'clamp(1.5rem, 5vw, 5rem)' }}
          >
            <AnimatedScore score={payload.scoreA} theme={theme} />
            <span
              className={`font-black leading-none select-none ${isDark ? 'text-white/25' : 'text-gray-300'}`}
              style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}
            >
              —
            </span>
            <AnimatedScore score={payload.scoreB} theme={theme} />
          </div>
        )}

        {/* Footer */}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: '1fr auto 1fr',
            padding: 'clamp(1.5rem, 4vh, 3.5rem) clamp(1.5rem, 3.5vw, 3rem)',
            borderTop: `1px solid ${divider}`,
            gap: '2vw',
          }}
        >
          {/* Team A side */}
          <div className="flex items-center gap-[1.5vw]">
            {!isPenaltyShootout && (
              <>
                <PenaltyXs count={payload.penaltiesA} size="clamp(1.8rem, 5.5vw, 5rem)" theme={theme} />
                <RestMinuteIcons currentHalf={payload.restMinutesUsedA[restHalf]} theme={theme} />
              </>
            )}
          </div>

          {/* Center: referee */}
          <div className={`flex items-center text-center ${textMuted}`}>
            {payload.referee && (
              <span style={{ fontSize: 'clamp(1.4rem, 3.5vw, 3rem)' }}>
                {payload.referee}
              </span>
            )}
          </div>

          {/* Team B side */}
          <div className="flex items-center justify-end gap-[1.5vw]">
            {!isPenaltyShootout && (
              <>
                <RestMinuteIcons currentHalf={payload.restMinutesUsedB[restHalf]} theme={theme} />
                <PenaltyXs count={payload.penaltiesB} size="clamp(1.8rem, 5.5vw, 5rem)" theme={theme} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Penalty shootout winner */}
      {isPenaltyShootout && payload.penaltyShootout && (() => {
        const shootout = payload.penaltyShootout!;
        const scoredA = shootout.bulletsA.filter(b => b === 'scored').length;
        const scoredB = shootout.bulletsB.filter(b => b === 'scored').length;
        const allDecided =
          shootout.bulletsA.every(b => b !== 'pending') && shootout.bulletsB.every(b => b !== 'pending');
        if (allDecided && scoredA !== scoredB) {
          return (
            <div
              className={`font-bold text-center mt-[2vh] animate-slide-up ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: 'clamp(1rem, 2.5vw, 2rem)' }}
            >
              {scoredA > scoredB ? payload.teamA.name : payload.teamB.name} wint!
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}

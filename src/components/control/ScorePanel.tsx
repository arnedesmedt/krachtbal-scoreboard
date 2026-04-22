import { useGameStore } from '../../store/gameStore';

const MAX_PENALTIES = 3;

interface ScorePanelProps {
  team: 'A' | 'B';
}

function PenaltyDots({ count }: { count: number }) {
  return (
    <div className="flex gap-1 justify-center mb-3">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span
          key={i}
          className={`text-xl font-black ${i < count ? 'text-red-500' : 'text-slate-200'}`}
        >
          ✕
        </span>
      ))}
    </div>
  );
}

export function ScorePanel({ team }: ScorePanelProps) {
  const scoreA = useGameStore((s) => s.scoreA);
  const scoreB = useGameStore((s) => s.scoreB);
  const penaltiesA = useGameStore((s) => s.penaltiesA);
  const penaltiesB = useGameStore((s) => s.penaltiesB);
  const adjustScore = useGameStore((s) => s.adjustScore);
  const addTeamPenalty = useGameStore((s) => s.addTeamPenalty);
  const config = useGameStore((s) => s.config);

  const score = team === 'A' ? scoreA : scoreB;
  const penalties = team === 'A' ? penaltiesA : penaltiesB;
  const teamName = team === 'A' ? config?.teamA.name : config?.teamB.name;
  const teamColor = team === 'A' ? config?.teamA.color : config?.teamB.color;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-center">
      <div className="text-base font-bold mb-2 truncate" style={{ color: teamColor }}>
        {teamName ?? `Team ${team}`}
      </div>
      <div className="text-6xl font-black text-slate-800 mb-4">{score}</div>
      <div className="flex gap-3 justify-center mb-4">
        <button
          type="button"
          onClick={() => adjustScore(team, -1)}
          disabled={score <= 0}
          aria-label={`Score verlagen Team ${team}`}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg font-bold text-slate-700 transition-colors"
        >
          −1
        </button>
        <button
          type="button"
          onClick={() => adjustScore(team, 1)}
          aria-label={`Score verhogen Team ${team}`}
          className="px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg font-bold text-green-700 transition-colors"
        >
          +1
        </button>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <PenaltyDots count={penalties} />
        <button
          type="button"
          onClick={() => addTeamPenalty(team)}
          aria-label={`Straf toevoegen Team ${team}`}
          className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors"
        >
          + Straf
        </button>
      </div>
    </div>
  );
}

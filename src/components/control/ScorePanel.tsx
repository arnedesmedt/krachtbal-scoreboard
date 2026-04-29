import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useBuzzer } from '../../hooks/useBuzzer';

const MAX_PENALTIES = 3;

interface ScorePanelProps {
  team: 'A' | 'B';
  onShowPenaltyConfirm?: () => void;
}

function PenaltyDots({ count }: { count: number }) {
  return (
    <div className="flex gap-1 justify-center mb-3">
      {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
        <span
          key={i}
          className={`font-black ${i < count ? 'text-red-500' : 'text-slate-200'}`}
          style={{ fontSize: 'clamp(1rem, 2.5vw, 2rem)' }}
        >
          ✕
        </span>
      ))}
    </div>
  );
}

export function ScorePanel({ team, onShowPenaltyConfirm }: ScorePanelProps) {
  const [thirdPenaltyConfirmed, setThirdPenaltyConfirmed] = useState(false);
  const { playBuzzer } = useBuzzer();
  
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

  const handleAddPenalty = () => {
    console.log('handleAddPenalty called:', { team, penalties, thirdPenaltyConfirmed });
    if (thirdPenaltyConfirmed) {
      // Reset penalties from 3 to 0
      console.log('Resetting penalties');
      resetPenalties();
    } else if (penalties >= 2) {
      // Show confirmation for 3rd penalty
      console.log('Showing confirmation for 3rd penalty');
      onShowPenaltyConfirm?.();
    } else {
      // Add penalty directly for 1st and 2nd penalties
      console.log('Adding penalty directly');
      addTeamPenalty(team);
    }
  };

  
  const handleAdjustScore = (delta: number) => {
    console.log('handleAdjustScore called:', { team, delta, score });
    adjustScore(team, delta);
  };

  const resetPenalties = () => {
    // Reset penalties from 3 to 0
    useGameStore.getState().setPenalties(team, 0);
    setThirdPenaltyConfirmed(false);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-gradient-to-br from-white to-slate-50 text-center overflow-hidden">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 p-6 w-full h-full flex flex-col justify-between">
          {/* Team Header */}
          <div className="bg-gradient-to-r from-transparent to-white/50 backdrop-blur-sm border-b border-slate-200/50 px-0 py-3 flex-shrink-0">
            <div className="font-bold truncate" style={{ color: teamColor, fontSize: 'clamp(1rem, 2.2vw, 1.5rem)' }}>
              {teamName ?? `Team ${team}`}
            </div>
          </div>

          {/* Score Display */}
          <div className="flex-1 flex items-center justify-center py-2 min-h-[80px]">
            <div className="relative">
              <div 
                className="font-black text-slate-800 drop-shadow-lg"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}
              >
                {score}
              </div>
              {/* Subtle glow effect */}
              <div 
                className="absolute inset-0 font-black text-transparent bg-gradient-to-r from-blue-200/20 to-purple-200/20 blur-xl"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1 }}
              >
                {score}
              </div>
            </div>
          </div>

          {/* Score Controls */}
          <div className="px-0 py-2 space-y-2 flex-shrink-0">
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => handleAdjustScore(-1)}
                disabled={score <= 0}
                aria-label={`Score verlagen Team ${team}`}
                className="flex-1 px-3 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 disabled:from-slate-50 disabled:to-slate-100 disabled:opacity-50 rounded-xl font-bold text-slate-700 transition-colors duration-200 shadow-md"
                style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}
              >
                −1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustScore(1)}
                aria-label={`Score verhogen Team ${team}`}
                className="flex-1 px-3 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}
              >
                +1
              </button>
            </div>

            {/* Penalty Section */}
            <div className="border-t border-slate-200/50 pt-2">
              <div className="flex justify-center mb-2">
                {Array.from({ length: MAX_PENALTIES }).map((_, i) => (
                  <span
                    key={i}
                    className="font-black transition-all duration-300"
                    style={{ 
                      fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                      color: i < penalties ? 'rgb(239 68 68)' : 'rgb(226 232 240)',
                      textShadow: i < penalties ? '0 2px 4px rgba(239, 68, 68, 0.3)' : 'none',
                      transform: i < penalties ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    ✕
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddPenalty}
                aria-label={thirdPenaltyConfirmed ? `Straffen resetten Team ${team}` : `Straf toevoegen Team ${team}`}
                className={`w-full px-3 py-3 ${thirdPenaltyConfirmed ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white rounded-lg font-semibold transition-colors duration-200 shadow-md`}
                style={{ fontSize: 'clamp(0.75rem, 1.4vw, 0.9rem)' }}
              >
                {thirdPenaltyConfirmed ? 'Reset' : '+ Straf'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
          </>
  );
}

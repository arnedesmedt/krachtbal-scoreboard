import { useGameStore } from '../../store/gameStore';
import { useBuzzer } from '../../hooks/useBuzzer';
import type { PenaltyBulletState } from '../../types/game';

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

function PenaltyBullets({ 
  bullets, 
  onBulletToggle 
}: { 
  bullets: PenaltyBulletState[]; 
  onBulletToggle: (index: number, newState: PenaltyBulletState) => void;
}) {
  const nextPendingIndex = bullets.findIndex(b => b === 'pending');
  return (
    <div className="flex gap-1 justify-center mb-6">
      {bullets.map((bullet, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            if (bullet === 'scored') onBulletToggle(index, 'missed');
            else if (bullet === 'missed') onBulletToggle(index, 'scored');
          }}
          disabled={bullet === 'pending'}
          className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
            bullet === 'scored' 
              ? 'bg-green-500 border-green-600 hover:bg-green-400 cursor-pointer' 
              : bullet === 'missed'
              ? 'bg-red-500 border-red-600 hover:bg-red-400 cursor-pointer'
              : 'bg-gray-300 border-gray-400 cursor-default'
          } ${
            index === nextPendingIndex ? 'ring-2 ring-blue-400' : ''
          }`}
          aria-label={`Vrije worp ${index + 1} - ${bullet}`}
        />
      ))}
    </div>
  );
}

export function ScorePanel({ team, onShowPenaltyConfirm }: ScorePanelProps) {
  const { playBuzzer } = useBuzzer();
  
  const scoreA = useGameStore((s) => s.scoreA);
  const scoreB = useGameStore((s) => s.scoreB);
  const penaltiesA = useGameStore((s) => s.penaltiesA);
  const penaltiesB = useGameStore((s) => s.penaltiesB);
  const phase = useGameStore((s) => s.phase);
  const penaltyShootout = useGameStore((s) => s.penaltyShootout);
  const adjustScore = useGameStore((s) => s.adjustScore);
  const addTeamPenalty = useGameStore((s) => s.addTeamPenalty);
  const setPenaltyBullet = useGameStore((s) => s.setPenaltyBullet);
  const config = useGameStore((s) => s.config);

  const score = team === 'A' ? scoreA : scoreB;
  const penalties = team === 'A' ? penaltiesA : penaltiesB;
  const teamName = team === 'A' ? config?.teamA.name : config?.teamB.name;
  const teamColor = team === 'A' ? config?.teamA.color : config?.teamB.color;

  const handleAddPenalty = () => {
    if (penalties >= MAX_PENALTIES) {
      useGameStore.getState().setPenalties(team, 0);
    } else if (penalties === MAX_PENALTIES - 1) {
      onShowPenaltyConfirm?.();
    } else {
      addTeamPenalty(team);
    }
  };

  
  const handleAdjustScore = (delta: number) => {
    adjustScore(team, delta);
  };

  const handlePenaltyBullet = (roundIndex: number, state: PenaltyBulletState) => {
    setPenaltyBullet(team, roundIndex, state);
  };

  const showPenaltyBullets = penaltyShootout && phase === 'PENALTY_SHOOTOUT';
  
  const teamBullets = team === 'A' ? penaltyShootout?.bulletsA : penaltyShootout?.bulletsB;
  const assignedA = penaltyShootout?.bulletsA.filter(b => b !== 'pending').length ?? 0;
  const assignedB = penaltyShootout?.bulletsB.filter(b => b !== 'pending').length ?? 0;
  const nextPendingIndex = teamBullets?.findIndex(b => b === 'pending') ?? -1;
  const isMyTurn = team === 'A' ? assignedA <= assignedB : assignedA > assignedB;
  const canAssign = showPenaltyBullets && nextPendingIndex !== -1 && isMyTurn;

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
          <div className="px-0 pt-0 pb-0 space-y-2 flex-shrink-0">
            {showPenaltyBullets && teamBullets && (
              <PenaltyBullets
                bullets={teamBullets}
                onBulletToggle={handlePenaltyBullet}
              />
            )}
            <div className="flex gap-4 justify-center">
              {showPenaltyBullets ? (
                <>
                  <button
                    type="button"
                    onClick={() => canAssign && handlePenaltyBullet(nextPendingIndex, 'missed')}
                    disabled={!canAssign}
                    aria-label={`Geen goal Team ${team}`}
                    className="flex-1 px-3 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                    style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}
                  >
                    Geen Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => canAssign && handlePenaltyBullet(nextPendingIndex, 'scored')}
                    disabled={!canAssign}
                    aria-label={`Goal Team ${team}`}
                    className="flex-1 px-3 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                    style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}
                  >
                    Goal
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Penalty Section */}
            <div>
              {/* Regular penalty X's */}
              {!showPenaltyBullets && (
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
              )}
              
              {/* Regular penalty button */}
              {!showPenaltyBullets && (
                <button
                  type="button"
                  onClick={handleAddPenalty}
                  aria-label={penalties >= MAX_PENALTIES ? `Straffen resetten Team ${team}` : `Straf toevoegen Team ${team}`}
                  className={`w-full px-3 py-3 ${penalties >= MAX_PENALTIES ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'} text-white rounded-lg font-semibold transition-colors duration-200 shadow-md`}
                  style={{ fontSize: 'clamp(0.75rem, 1.4vw, 0.9rem)' }}
                >
                  {penalties >= MAX_PENALTIES ? 'Reset' : '+ Straf'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
          </>
  );
}

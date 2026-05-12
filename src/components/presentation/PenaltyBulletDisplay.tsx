import type { GameStateUpdatePayload, PenaltyBulletState } from '../../types/game';

interface PenaltyBulletDisplayProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

function PenaltyBulletRow({ 
  bullets, 
  currentRound, 
  theme = 'light' 
}: { 
  bullets: PenaltyBulletState[]; 
  currentRound: number; 
  theme?: 'light' | 'dark';
}) {
  const getBulletColor = (state: PenaltyBulletState, index: number) => {
    if (state === 'scored') return theme === 'dark' ? '#10b981' : '#059669'; // green-500/green-600
    if (state === 'missed') return theme === 'dark' ? '#ef4444' : '#dc2626'; // red-500/red-600
    return theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'; // gray
  };

  return (
    <div className="flex gap-[1vw] justify-center items-center">
      {bullets.map((bullet, index) => (
        <div
          key={index}
          className="relative"
          style={{
            width: '3vw',
            height: '3vw',
            minWidth: '24px',
            minHeight: '24px',
          }}
        >
          <div
            className={`w-full h-full rounded-full border-2 transition-all duration-300 ${
              index === currentRound - 1 && bullet === 'pending' ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
            }`}
            style={{
              backgroundColor: getBulletColor(bullet, index),
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            }}
          />
          {index === currentRound - 1 && bullet === 'pending' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ width: '0.5vw', height: '0.5vw', minWidth: '4px', minHeight: '4px' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PenaltyBulletDisplay({ payload, theme = 'light' }: PenaltyBulletDisplayProps) {
  if (!payload.penaltyShootout) return null;

  const { bulletsA, bulletsB, currentRound, suddenDeath } = payload.penaltyShootout;
  const scoredA = bulletsA.filter(b => b === 'scored').length;
  const scoredB = bulletsB.filter(b => b === 'scored').length;
  
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const headerColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className="text-center">
      {/* Header */}
      <div className={`font-bold uppercase tracking-widest mb-[2vh] ${headerColor}`} style={{ fontSize: '2vw' }}>
        {suddenDeath ? 'Sudden Death' : 'Vrije Worpen'}
      </div>
      
      {/* Score */}
      <div className={`font-black ${headerColor} mb-[2vh]`} style={{ fontSize: '4vw' }}>
        {scoredA} - {scoredB}
      </div>
      
      {/* Round indicator */}
      <div className={`${textColor} mb-[3vh]`} style={{ fontSize: '1.5vw' }}>
        Ronde {currentRound}{suddenDeath ? ' (Sudden Death)' : ''}
      </div>
      
      {/* Penalty bullets grid */}
      <div className="grid grid-cols-2 gap-[4vw] items-center">
        {/* Team A */}
        <div>
          <div className={`font-semibold ${headerColor} mb-[1vh] text-center`} style={{ fontSize: '2vw' }}>
            {payload.teamA.name}
          </div>
          <PenaltyBulletRow bullets={bulletsA} currentRound={currentRound} theme={theme} />
        </div>
        
        {/* Team B */}
        <div>
          <div className={`font-semibold ${headerColor} mb-[1vh] text-center`} style={{ fontSize: '2vw' }}>
            {payload.teamB.name}
          </div>
          <PenaltyBulletRow bullets={bulletsB} currentRound={currentRound} theme={theme} />
        </div>
      </div>
      
      {/* Winner announcement */}
      {currentRound > 4 && scoredA !== scoredB && (
        <div className={`font-bold ${headerColor} mt-[3vh]`} style={{ fontSize: '2.5vw' }}>
          {scoredA > scoredB ? payload.teamA.name : payload.teamB.name} wint!
        </div>
      )}
    </div>
  );
}

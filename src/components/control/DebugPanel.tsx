import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { GameState } from '../../types/game';

const DUMMY_CONFIG: GameState['config'] = {
  gameId: 'debug',
  teamA: { name: 'Team A', color: '#3b82f6', color2: '#1d4ed8' },
  teamB: { name: 'Team B', color: '#ef4444', color2: '#b91c1c' },
  referee: 'Debug',
  league: 'Debug League',
  halfTimeLengthMinutes: 25,
};

type PhaseJump = {
  label: string;
  phase: GameState['phase'];
  partial: Partial<GameState>;
};

const PHASE_JUMPS: PhaseJump[] = [
  {
    label: '1e Helft',
    phase: 'FIRST_HALF',
    partial: {
      phase: 'FIRST_HALF',
      halvesPlayed: [],
      playedTimeMs: 0,
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: 'Rust',
    phase: 'HALF_TIME',
    partial: {
      phase: 'HALF_TIME',
      halvesPlayed: ['FIRST_HALF'],
      playedTimeMs: 0,
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: '2e Helft',
    phase: 'SECOND_HALF',
    partial: {
      phase: 'SECOND_HALF',
      halvesPlayed: ['FIRST_HALF'],
      playedTimeMs: 0,
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: 'Einde (2e)',
    phase: 'ENDED',
    partial: {
      phase: 'ENDED',
      halvesPlayed: ['FIRST_HALF', 'SECOND_HALF'],
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: '3e Helft',
    phase: 'THIRD_HALF',
    partial: {
      phase: 'THIRD_HALF',
      halvesPlayed: ['FIRST_HALF', 'SECOND_HALF'],
      playedTimeMs: 0,
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: '4e Helft',
    phase: 'FOURTH_HALF',
    partial: {
      phase: 'FOURTH_HALF',
      halvesPlayed: ['FIRST_HALF', 'SECOND_HALF', 'THIRD_HALF'],
      playedTimeMs: 0,
      clockRunning: false,
      penaltyShootout: null,
    },
  },
  {
    label: 'Einde (4e, gelijk)',
    phase: 'ENDED',
    partial: {
      phase: 'ENDED',
      halvesPlayed: ['FIRST_HALF', 'SECOND_HALF', 'THIRD_HALF', 'FOURTH_HALF'],
      clockRunning: false,
      scoreA: 1,
      scoreB: 1,
      penaltyShootout: null,
    },
  },
  {
    label: 'Vrije Worpen',
    phase: 'PENALTY_SHOOTOUT',
    partial: {
      phase: 'PENALTY_SHOOTOUT',
      halvesPlayed: ['FIRST_HALF', 'SECOND_HALF', 'THIRD_HALF', 'FOURTH_HALF'],
      clockRunning: false,
      scoreA: 1,
      scoreB: 1,
      penaltyShootout: {
        bulletsA: ['pending', 'pending', 'pending', 'pending'],
        bulletsB: ['pending', 'pending', 'pending', 'pending'],
        currentRound: 1,
        suddenDeath: false,
        firstTeam: null,
      },
    },
  },
];

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const phase = useGameStore((s) => s.phase);
  const config = useGameStore((s) => s.config);

  const jumpTo = (partial: Partial<GameState>) => {
    useGameStore.setState({ config: config ?? DUMMY_CONFIG, ...partial });
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9998] flex flex-col-reverse items-start gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg text-sm shadow-lg"
      >
        🛠 Debug {open ? '▼' : '▲'}
      </button>
      {open && (
        <div className="bg-white/95 backdrop-blur-sm border border-yellow-300 rounded-xl shadow-xl p-3 flex flex-col gap-1 min-w-[190px]">
          <div className="text-xs font-semibold text-yellow-700 uppercase tracking-wider mb-1 px-1">
            Fase: <span className="text-yellow-900">{phase}</span>
          </div>
          {PHASE_JUMPS.map((jump) => (
            <button
              key={jump.label}
              type="button"
              onClick={() => jumpTo(jump.partial)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                phase === jump.phase && jump.partial.phase === phase
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {jump.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

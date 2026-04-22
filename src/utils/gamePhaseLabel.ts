import type { GamePhase } from '../types/game';

export function phaseLabel(phase: GamePhase): string {
  switch (phase) {
    case 'SETUP':
      return 'Instelling';
    case 'FIRST_HALF':
      return 'Eerste Helft';
    case 'HALF_TIME':
      return 'Rust';
    case 'SECOND_HALF':
      return 'Tweede Helft';
    case 'ENDED':
      return 'Afgelopen';
  }
}


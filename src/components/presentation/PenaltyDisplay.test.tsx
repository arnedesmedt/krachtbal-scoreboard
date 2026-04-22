import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PenaltyDisplay } from './PenaltyDisplay';
import type { GameStateUpdatePayload } from '../../types/game';

const payload: GameStateUpdatePayload = {
  phase: 'FIRST_HALF',
  scoreA: 0,
  scoreB: 0,
  playedTimeMs: 0,
  halfTimeLengthMs: 1200000,
  clockRunning: false,
  restMinute: null,
  teamA: {
    name: 'Eagles',
    color: '#ff0000',
    color2: '#ffffff',
  },
  teamB: {
    name: 'Lions',
    color: '#0000ff',
    color2: '#ffffff',
  },
  referee: 'Ref Sam',
  league: '',
  penaltiesA: 3,
  penaltiesB: 0,
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
};

describe('PenaltyDisplay', () => {
  it('renders team names', () => {
    render(<PenaltyDisplay payload={payload} />);
    expect(screen.getByText('Eagles')).toBeInTheDocument();
    expect(screen.getByText('Lions')).toBeInTheDocument();
  });

  it('renders penalty X markers for team A', () => {
    render(<PenaltyDisplay payload={payload} />);
    // penaltiesA is 3, penaltiesB is 0 — all 6 X markers are rendered but only 3 are red
    const markers = screen.getAllByText('✕');
    expect(markers).toHaveLength(6);
  });
});


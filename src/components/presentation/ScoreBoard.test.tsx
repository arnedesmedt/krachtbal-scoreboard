import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreBoard } from './ScoreBoard';
import type { GameStateUpdatePayload } from '../../types/game';

const payload: GameStateUpdatePayload = {
  phase: 'FIRST_HALF',
  scoreA: 3,
  scoreB: 1,
  penaltiesA: 0,
  penaltiesB: 0,
  playedTimeMs: 0,
  halfTimeLengthMs: 1200000,
  clockRunning: false,
  restMinute: null,
  teamA: { name: 'Eagles', color: '#ff0000', color2: '#ffffff' },
  teamB: { name: 'Lions', color: '#0000ff', color2: '#ffffff' },
  referee: 'Ref Sam',
  league: '',
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  presentationTheme: "light",
  penaltyShootout: null,
};

describe('ScoreBoard', () => {
  it('renders team names', () => {
    render(<ScoreBoard payload={payload} />);
    expect(screen.getByText('Eagles')).toBeInTheDocument();
    expect(screen.getByText('Lions')).toBeInTheDocument();
  });

  it('renders correct score numbers', () => {
    render(<ScoreBoard payload={payload} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies team colors as backgroundColor', () => {
    render(<ScoreBoard payload={payload} />);
    const eaglesEl = screen.getByText('Eagles');
    expect(eaglesEl).toHaveStyle({ backgroundColor: '#ff0000' });
  });
});

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
    players: [{ number: 7, name: 'Alice', penalties: 3 }],
  },
  teamB: {
    name: 'Lions',
    color: '#0000ff',
    players: [{ number: 5, name: 'Bob', penalties: 0 }],
  },
  referee: 'Ref Sam',
  restMinutesUsedA: 0,
  restMinutesUsedB: 0,
};

describe('PenaltyDisplay', () => {
  it('renders exactly 3 X characters for a player with 3 penalties', () => {
    render(<PenaltyDisplay payload={payload} />);
    const xCells = screen.getAllByText('XXX');
    expect(xCells).toHaveLength(1);
    expect(xCells[0].textContent).toBe('XXX');
  });

  it('renders empty for a player with 0 penalties', () => {
    render(<PenaltyDisplay payload={payload} />);
    // Bob has 0 penalties — his penalty cell should be empty
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });
});


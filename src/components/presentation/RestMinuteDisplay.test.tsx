import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RestMinuteDisplay } from './RestMinuteDisplay';
import type { GameStateUpdatePayload } from '../../types/game';

const basePayload: GameStateUpdatePayload = {
  phase: 'FIRST_HALF',
  scoreA: 0,
  scoreB: 0,
  playedTimeMs: 0,
  halfTimeLengthMs: 1200000,
  clockRunning: false,
  restMinute: null,
  teamA: { name: 'Eagles', color: '#ff0000', players: [] },
  teamB: { name: 'Lions', color: '#0000ff', players: [] },
  referee: 'Ref Sam',
  restMinutesUsedA: 0,
  restMinutesUsedB: 0,
};

describe('RestMinuteDisplay', () => {
  it('is hidden when restMinute is null', () => {
    const { container } = render(<RestMinuteDisplay payload={basePayload} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows countdown and team name when restMinute is active', () => {
    const payload: GameStateUpdatePayload = {
      ...basePayload,
      restMinute: { initiatorTeam: 'A', remainingMs: 45000, buzzerFired: true },
    };
    render(<RestMinuteDisplay payload={payload} />);
    expect(screen.getByText(/Eagles/i)).toBeInTheDocument();
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });
});


import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestMinutePanel } from './RestMinutePanel';
import { useGameStore } from '../../store/gameStore';
import type { GameConfig } from '../../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const config: GameConfig = {
  teamA: { name: 'Eagles', color: '#f00', players: [] },
  teamB: { name: 'Lions', color: '#00f', players: [] },
  referee: 'R',
  halfTimeLengthMinutes: 20,
  numPresentationWindows: 1,
};

describe('RestMinutePanel', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 'FIRST_HALF',
      clockRunning: true,
      restMinute: null,
      config,
      restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
      restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
    });
  });

  it('initiate button opens InitiatorPopup', async () => {
    render(<RestMinutePanel />);
    await userEvent.click(screen.getByRole('button', { name: /Initiate Rest Minute/i }));
    expect(screen.getByText(/Who takes the rest minute/i)).toBeInTheDocument();
  });

  it('countdown shown when rest minute active', () => {
    useGameStore.setState({
      restMinute: { initiatorTeam: 'A', remainingMs: 45000, buzzerFired: true },
    });
    render(<RestMinutePanel />);
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('disabled when clock stopped', () => {
    useGameStore.setState({ clockRunning: false });
    render(<RestMinutePanel />);
    expect(screen.getByRole('button', { name: /Initiate Rest Minute/i })).toBeDisabled();
  });
});


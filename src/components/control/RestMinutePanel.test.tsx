import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestMinutePanel } from './RestMinutePanel';
import { useGameStore } from '../../store/gameStore';
import type { GameConfig } from '../../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const config: GameConfig = {
  gameId: 'test-game-1',
  teamA: { name: 'Eagles', color: '#f00', color2: '#ffffff' },
  teamB: { name: 'Lions', color: '#00f', color2: '#ffffff' },
  referee: 'R',
  league: '',
  halfTimeLengthMinutes: 20,
};

describe('RestMinutePanel', () => {
  beforeEach(() => {
    useGameStore.setState({
      phase: 'FIRST_HALF',
      clockRunning: true,
      restMinute: null,
      config,
      restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      presentationTheme: "light"
    });
  });

  it('initiate button opens InitiatorPopup', async () => {
    render(<RestMinutePanel />);
    await userEvent.click(screen.getByRole('button', { name: /Rustminuut starten/i }));
    expect(screen.getByText(/Wie neemt de rustminuut/i)).toBeInTheDocument();
  });

  it('countdown shown when rest minute active', () => {
    useGameStore.setState({
      restMinute: { initiatorTeam: 'A', remainingMs: 45000, buzzerFired5s: true },
    });
    render(<RestMinutePanel />);
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('disabled when clock stopped', () => {
    useGameStore.setState({ clockRunning: false });
    render(<RestMinutePanel />);
    expect(screen.getByRole('button', { name: /Rustminuut starten/i })).toBeDisabled();
  });
});


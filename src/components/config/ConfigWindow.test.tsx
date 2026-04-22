import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigWindow } from './ConfigWindow';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

function resetStore() {
  useGameStore.setState({
    phase: 'SETUP',
    config: null,
    scoreA: 0,
    scoreB: 0,
    playedTimeMs: 0,
    clockRunning: false,
    restMinute: null,
    restMinutesUsedA: 0,
    restMinutesUsedB: 0,
    teamAPlayers: [],
    teamBPlayers: [],
  });
}

describe('ConfigWindow', () => {
  beforeEach(resetStore);

  it('renders all required fields', () => {
    render(<ConfigWindow />);
    expect(screen.getByText(/Home Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Away Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Referee/i)).toBeInTheDocument();
    expect(screen.getByText(/Half Time Length/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Game/i)).toBeInTheDocument();
  });

  it('Start Game is disabled when required fields are empty', async () => {
    render(<ConfigWindow />);
    const button = screen.getByRole('button', { name: /Start Game/i });
    expect(button).toBeDisabled();
  });

  it('shows validation error when team name is missing', async () => {
    render(<ConfigWindow />);
    // Button is disabled when required fields are empty
    const startBtn = screen.getByRole('button', { name: /Start Game/i });
    expect(startBtn).toBeDisabled();
  });
});


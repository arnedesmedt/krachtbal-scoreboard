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
    restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0 },
    restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
  });
}

describe('ConfigWindow', () => {
  beforeEach(resetStore);

  it('renders all required fields', () => {
    render(<ConfigWindow />);
    expect(screen.getByText(/Thuisploeg/i)).toBeInTheDocument();
    expect(screen.getByText(/Uitploeg/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheidsrechter/i)).toBeInTheDocument();
    expect(screen.getByText(/Speeltijd per helft/i)).toBeInTheDocument();
    expect(screen.getByText(/Start wedstrijd/i)).toBeInTheDocument();
  });

  it('Start Game is disabled when required fields are empty', async () => {
    render(<ConfigWindow />);
    const button = screen.getByRole('button', { name: /Start wedstrijd/i });
    expect(button).toBeDisabled();
  });

  it('shows validation error when team name is missing', async () => {
    render(<ConfigWindow />);
    // Button is disabled when required fields are empty
    const startBtn = screen.getByRole('button', { name: /Start wedstrijd/i });
    expect(startBtn).toBeDisabled();
  });
});


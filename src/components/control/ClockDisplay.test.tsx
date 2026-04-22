import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClockDisplay } from './ClockDisplay';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

function setActiveHalf() {
  useGameStore.setState({ phase: 'FIRST_HALF', clockRunning: false, playedTimeMs: 5000 });
}

describe('ClockDisplay', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'SETUP', clockRunning: false, playedTimeMs: 0 });
  });

  it('renders formatted time', () => {
    useGameStore.setState({ playedTimeMs: 65000 });
    render(<ClockDisplay />);
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  it('Start button calls toggleClock', async () => {
    const toggleClock = vi.fn();
    setActiveHalf();
    useGameStore.setState({ toggleClock } as never);
    render(<ClockDisplay />);
    await userEvent.click(screen.getByRole('button', { name: /Start clock/i }));
    expect(toggleClock).toHaveBeenCalled();
  });

  it('confirming Stop calls abandonGame', async () => {
    const abandonGame = vi.fn().mockResolvedValue(undefined);
    setActiveHalf();
    useGameStore.setState({ clockRunning: true, abandonGame } as never);
    render(<ClockDisplay />);
    await userEvent.click(screen.getByRole('button', { name: /Stop game/i }));
    await userEvent.click(screen.getByRole('button', { name: /Yes, stop/i }));
    expect(abandonGame).toHaveBeenCalled();
  });

  it('shows Start when stopped, Stop when running', () => {
    setActiveHalf();
    useGameStore.setState({ clockRunning: false });
    const { rerender } = render(<ClockDisplay />);
    expect(screen.getByRole('button', { name: /Start clock/i })).toBeInTheDocument();

    useGameStore.setState({ clockRunning: true });
    rerender(<ClockDisplay />);
    expect(screen.getByRole('button', { name: /Stop game/i })).toBeInTheDocument();
  });

  it('Stop button shows confirmation popup', async () => {
    setActiveHalf();
    useGameStore.setState({ clockRunning: true });
    render(<ClockDisplay />);
    await userEvent.click(screen.getByRole('button', { name: /Stop game/i }));
    expect(screen.getByText(/Stop the game\?/i)).toBeInTheDocument();
  });

  it('Cancel in popup hides popup without stopping', async () => {
    setActiveHalf();
    useGameStore.setState({ clockRunning: true });
    render(<ClockDisplay />);
    await userEvent.click(screen.getByRole('button', { name: /Stop game/i }));
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Stop the game\?/i)).not.toBeInTheDocument();
  });
});

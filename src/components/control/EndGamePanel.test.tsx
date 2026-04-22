import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EndGamePanel } from './EndGamePanel';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

describe('EndGamePanel', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'FIRST_HALF' });
  });

  it('not rendered during FIRST_HALF', () => {
    const { container } = render(<EndGamePanel />);
    expect(container.firstChild).toBeNull();
  });

  it('rendered during ENDED', () => {
    useGameStore.setState({ phase: 'ENDED' });
    render(<EndGamePanel />);
    expect(screen.getByText(/Reset Game/i)).toBeInTheDocument();
  });

  it('button calls resetGame', async () => {
    const resetGame = vi.fn();
    useGameStore.setState({ phase: 'ENDED', resetGame } as never);
    render(<EndGamePanel />);
    await userEvent.click(screen.getByRole('button', { name: /Reset Game/i }));
    expect(resetGame).toHaveBeenCalled();
  });
});


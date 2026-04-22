import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HalfTimePanel } from './HalfTimePanel';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

describe('HalfTimePanel', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'FIRST_HALF' });
  });

  it('not rendered during FIRST_HALF', () => {
    const { container } = render(<HalfTimePanel />);
    expect(container.firstChild).toBeNull();
  });

  it('rendered during HALF_TIME', () => {
    useGameStore.setState({ phase: 'HALF_TIME' });
    render(<HalfTimePanel />);
    expect(screen.getByText(/Start Second Half/i)).toBeInTheDocument();
  });

  it('button calls startSecondHalf', async () => {
    const startSecondHalf = vi.fn();
    useGameStore.setState({ phase: 'HALF_TIME', startSecondHalf } as never);
    render(<HalfTimePanel />);
    await userEvent.click(screen.getByRole('button', { name: /Start Second Half/i }));
    expect(startSecondHalf).toHaveBeenCalled();
  });
});


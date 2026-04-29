import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScorePanel } from './ScorePanel';
import { useGameStore } from '../../store/gameStore';
import type { GameConfig } from '../../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const config: GameConfig = {
  teamA: { name: 'Eagles', color: '#f00', color2: '#ffffff' },
  teamB: { name: 'Lions', color: '#00f', color2: '#ffffff' },
  referee: 'R',
  league: '',
  gameId: "test-game",
  halfTimeLengthMinutes: 20,
};

describe('ScorePanel', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'FIRST_HALF', config, scoreA: 0, scoreB: 0, penaltiesA: 0, penaltiesB: 0 });
  });

  it('increment dispatches adjustScore(A, +1)', async () => {
    const adjustScore = vi.fn();
    useGameStore.setState({ adjustScore } as never);
    render(<ScorePanel team="A" />);
    await userEvent.click(screen.getByRole('button', { name: /Score verhogen Team A/i }));
    expect(adjustScore).toHaveBeenCalledWith('A', 1);
  });

  it('decrement dispatches adjustScore(A, -1)', async () => {
    const adjustScore = vi.fn();
    useGameStore.setState({ scoreA: 1, adjustScore } as never);
    render(<ScorePanel team="A" />);
    await userEvent.click(screen.getByRole('button', { name: /Score verlagen Team A/i }));
    expect(adjustScore).toHaveBeenCalledWith('A', -1);
  });

  it('decrement disabled at score 0', () => {
    render(<ScorePanel team="A" />);
    expect(screen.getByRole('button', { name: /Score verlagen Team A/i })).toBeDisabled();
  });

  it('penalty button dispatches addTeamPenalty(A)', async () => {
    const addTeamPenalty = vi.fn();
    useGameStore.setState({ addTeamPenalty } as never);
    render(<ScorePanel team="A" />);
    await userEvent.click(screen.getByRole('button', { name: /Straf toevoegen Team A/i }));
    expect(addTeamPenalty).toHaveBeenCalledWith('A');
  });
});


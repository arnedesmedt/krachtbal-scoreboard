import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from './useGameTimer';
import { useGameStore } from '../store/gameStore';
import type { GameConfig } from '../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const validConfig: GameConfig = {
  teamA: { name: 'A', color: '#ff0000', color2: '#ffffff' },
  teamB: { name: 'B', color: '#0000ff', color2: '#ffffff' },
  referee: 'R',
  league: '',
  gameId: "test-game",
  halfTimeLengthMinutes: 20,
};

describe('useGameTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.setState({
      phase: 'SETUP',
      config: null,
      scoreA: 0,
      scoreB: 0,
      playedTimeMs: 0,
      clockRunning: false,
      restMinute: null,
      restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls tickClock when clock is running (via setInterval)', () => {
    const tickClock = vi.fn();
    useGameStore.setState({ phase: 'FIRST_HALF', config: validConfig, clockRunning: true });
    useGameStore.setState({ tickClock } as never);

    renderHook(() => useGameTimer());

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(tickClock).toHaveBeenCalled();
  });

  it('does not call tickClock when clock is stopped', () => {
    const tickClock = vi.fn();
    useGameStore.setState({ phase: 'FIRST_HALF', config: validConfig, clockRunning: false });
    useGameStore.setState({ tickClock } as never);

    renderHook(() => useGameTimer());

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(tickClock).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameTimer } from './useGameTimer';
import { useGameStore } from '../store/gameStore';
import type { GameConfig } from '../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const validConfig: GameConfig = {
  teamA: { name: 'A', color: '#ff0000', players: [{ number: 1, name: 'P', penalties: 0 }] },
  teamB: { name: 'B', color: '#0000ff', players: [{ number: 1, name: 'Q', penalties: 0 }] },
  referee: 'R',
  halfTimeLengthMinutes: 30,
  numPresentationWindows: 1,
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
      restMinutesUsedA: 0,
      restMinutesUsedB: 0,
      teamAPlayers: [],
      teamBPlayers: [],
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

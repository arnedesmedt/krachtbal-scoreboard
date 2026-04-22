import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import type { GameConfig } from '../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const validConfig: GameConfig = {
  teamA: {
    name: 'Team Alpha',
    color: '#FF0000',
    players: [{ number: 1, name: 'Alice', penalties: 0 }],
  },
  teamB: {
    name: 'Team Beta',
    color: '#0000FF',
    players: [{ number: 1, name: 'Bob', penalties: 0 }],
  },
  referee: 'Ref Joe',
  halfTimeLengthMinutes: 1,
  numPresentationWindows: 2,
};

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
    restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
  });
}

function setEnded() {
  useGameStore.setState({
    phase: 'ENDED',
    config: validConfig,
    scoreA: 3,
    scoreB: 2,
    playedTimeMs: 60_000,
    clockRunning: false,
    restMinute: null,
    restMinutesUsedA: { FIRST_HALF: 1, SECOND_HALF: 0 },
    restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
    restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
  });
}

describe('gameStore – resetGame', () => {
  beforeEach(resetStore);

  it('resets full state to initial after resetGame', async () => {
    setEnded();
    useGameStore.getState().resetGame();
    await new Promise((r) => setTimeout(r, 20));
    const state = useGameStore.getState();
    expect(state.phase).toBe('SETUP');
    expect(state.scoreA).toBe(0);
    expect(state.scoreB).toBe(0);
    expect(state.config).toBeNull();
    expect(state.restMinute).toBeNull();
    expect(state.restMinutesUsedA).toEqual({ FIRST_HALF: 0, SECOND_HALF: 0 });
    expect(state.restMinutesUsedB).toEqual({ FIRST_HALF: 0, SECOND_HALF: 0 });
  });

  it('is blocked when phase !== ENDED', async () => {
    useGameStore.setState({ phase: 'FIRST_HALF', config: validConfig, scoreA: 3 });
    useGameStore.getState().resetGame();
    await new Promise((r) => setTimeout(r, 10));
    expect(useGameStore.getState().scoreA).toBe(3);
  });
});

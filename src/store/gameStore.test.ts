import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from './gameStore';
import type { GameConfig } from '../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const validConfig: GameConfig = {
  teamA: { name: 'Team Alpha', color: '#FF0000', color2: '#ffffff' },
  teamB: { name: 'Team Beta', color: '#0000FF', color2: '#ffffff' },
  referee: 'Ref Joe',
  league: '',
  gameId: "test-game",
  halfTimeLengthMinutes: 20,
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
    restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
    restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
    restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  presentationTheme: "light"
  });
}

describe('gameStore – setConfig', () => {
  beforeEach(resetStore);

  it('sets config in SETUP phase', () => {
    useGameStore.getState().setConfig(validConfig);
    expect(useGameStore.getState().config).toEqual(validConfig);
  });

  it('is blocked outside SETUP phase', () => {
    useGameStore.setState({ phase: 'FIRST_HALF' });
    useGameStore.getState().setConfig(validConfig);
    expect(useGameStore.getState().config).toBeNull();
  });
});

describe('gameStore – startGame', () => {
  beforeEach(resetStore);

  it('transitions to FIRST_HALF with valid config', () => {
    useGameStore.getState().setConfig(validConfig);
    useGameStore.getState().startGame();
    expect(useGameStore.getState().phase).toBe('FIRST_HALF');
  });

  it('is blocked if no config set', () => {
    useGameStore.getState().startGame();
    expect(useGameStore.getState().phase).toBe('SETUP');
  });
});

describe('gameStore – full phase transition chain', () => {
  beforeEach(resetStore);

  it('SETUP → FIRST_HALF → HALF_TIME → SECOND_HALF → ENDED → SETUP', () => {
    const halfMs = 1 * 60 * 1000; // 1 minute
    const cfg = { ...validConfig, halfTimeLengthMinutes: 1 };
    useGameStore.getState().setConfig(cfg);
    useGameStore.getState().startGame();
    expect(useGameStore.getState().phase).toBe('FIRST_HALF');

    useGameStore.getState().toggleClock();
    useGameStore.getState().tickClock(halfMs);
    expect(useGameStore.getState().phase).toBe('HALF_TIME');

    useGameStore.getState().startSecondHalf();
    expect(useGameStore.getState().phase).toBe('SECOND_HALF');
    expect(useGameStore.getState().playedTimeMs).toBe(0);

    useGameStore.getState().toggleClock();
    useGameStore.getState().tickClock(halfMs);
    expect(useGameStore.getState().phase).toBe('ENDED');

    useGameStore.getState().resetGame();
    // Wait for async close
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(useGameStore.getState().phase).toBe('SETUP');
        resolve();
      }, 10);
    });
  });
});

describe('gameStore – adjustScore', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().setConfig(validConfig);
    useGameStore.getState().startGame();
    useGameStore.getState().toggleClock();
  });

  it('increments score A', () => {
    useGameStore.getState().adjustScore('A', 1);
    expect(useGameStore.getState().scoreA).toBe(1);
  });

  it('decrements score A', () => {
    useGameStore.getState().adjustScore('A', 1);
    useGameStore.getState().adjustScore('A', -1);
    expect(useGameStore.getState().scoreA).toBe(0);
  });

  it('cannot go below 0', () => {
    useGameStore.getState().adjustScore('A', -1);
    expect(useGameStore.getState().scoreA).toBe(0);
  });

  it('is blocked outside active half', () => {
    useGameStore.setState({ phase: 'HALF_TIME' });
    useGameStore.getState().adjustScore('A', 1);
    expect(useGameStore.getState().scoreA).toBe(0);
  });
});

describe('gameStore – initiateRestMinute', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().setConfig(validConfig);
    useGameStore.getState().startGame();
    useGameStore.getState().toggleClock();
  });

  it('sets restMinute correctly', () => {
    useGameStore.getState().startRestMinute();
    const rm = useGameStore.getState().restMinute;
    expect(rm).not.toBeNull();
    expect(rm?.initiatorTeam).toBeNull(); // pending until assigned
    expect(rm?.remainingMs).toBe(60_000);
  });

  it('blocked when clock stopped', () => {
    useGameStore.getState().toggleClock(); // stop clock
    useGameStore.getState().startRestMinute();
    expect(useGameStore.getState().restMinute).toBeNull();
  });

  it('blocked when restMinute already active', () => {
    useGameStore.getState().startRestMinute();
    useGameStore.getState().assignRestMinute('A');
    useGameStore.getState().startRestMinute(); // second attempt blocked
    expect(useGameStore.getState().restMinute?.initiatorTeam).toBe('A');
  });
});

describe('gameStore – tickRestMinute', () => {
  beforeEach(() => {
    resetStore();
    useGameStore.getState().setConfig(validConfig);
    useGameStore.getState().startGame();
    useGameStore.getState().toggleClock();
    useGameStore.getState().startRestMinute();
    useGameStore.getState().assignRestMinute('A');
  });

  it('decrements remainingMs', () => {
    useGameStore.getState().tickRestMinute(1000);
    expect(useGameStore.getState().restMinute?.remainingMs).toBe(59_000);
  });

  it('clears restMinute at 0 and increments counter A', () => {
    useGameStore.getState().tickRestMinute(60_001);
    expect(useGameStore.getState().restMinute).toBeNull();
    // Counter was already incremented at assignRestMinute time
    expect(useGameStore.getState().restMinutesUsedA).toEqual({ FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 });
    expect(useGameStore.getState().restMinutesUsedB).toEqual({ FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 });
    expect(useGameStore.getState().restMinutesUsedReferee).toEqual({ FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 });
  presentationTheme: "light"
  });
});

describe('gameStore – tickClock', () => {
  beforeEach(resetStore);

  it('triggers HALF_TIME transition at threshold', () => {
    const cfg = { ...validConfig, halfTimeLengthMinutes: 1 };
    useGameStore.getState().setConfig(cfg);
    useGameStore.getState().startGame();
    useGameStore.getState().toggleClock();
    useGameStore.getState().tickClock(60_000);
    expect(useGameStore.getState().phase).toBe('HALF_TIME');
    expect(useGameStore.getState().clockRunning).toBe(false);
  });

  it('triggers ENDED transition after second half', () => {
    const cfg = { ...validConfig, halfTimeLengthMinutes: 1 };
    useGameStore.getState().setConfig(cfg);
    useGameStore.getState().startGame();
    useGameStore.getState().toggleClock();
    useGameStore.getState().tickClock(60_000);
    useGameStore.getState().startSecondHalf();
    useGameStore.getState().toggleClock();
    useGameStore.getState().tickClock(60_000);
    expect(useGameStore.getState().phase).toBe('ENDED');
  });
});

describe('gameStore – resetCurrentHalf', () => {
  beforeEach(resetStore);

  it('resets rest minutes used for the current half', () => {
    useGameStore.setState({
      phase: 'FIRST_HALF',
      config: validConfig,
      playedTimeMs: 5000,
      clockRunning: false,
      restMinutesUsedA: { FIRST_HALF: 1, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 1, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedReferee: { FIRST_HALF: 1, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
    });
    useGameStore.getState().resetCurrentHalf();
    const state = useGameStore.getState();
    expect(state.playedTimeMs).toBe(0);
    expect(state.clockRunning).toBe(false);
    expect(state.restMinute).toBeNull();
    expect(state.restMinutesUsedA.FIRST_HALF).toBe(0);
    expect(state.restMinutesUsedB.FIRST_HALF).toBe(0);
    expect(state.restMinutesUsedReferee.FIRST_HALF).toBe(0);
  });

  it('only resets rest minutes for the current half, not other halves', () => {
    useGameStore.setState({
      phase: 'SECOND_HALF',
      config: validConfig,
      playedTimeMs: 3000,
      clockRunning: false,
      restMinutesUsedA: { FIRST_HALF: 2, SECOND_HALF: 1, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 1, SECOND_HALF: 1, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 1, THIRD_HALF: 0, FOURTH_HALF: 0 },
    });
    useGameStore.getState().resetCurrentHalf();
    const state = useGameStore.getState();
    expect(state.restMinutesUsedA.SECOND_HALF).toBe(0);
    expect(state.restMinutesUsedA.FIRST_HALF).toBe(2); // untouched
    expect(state.restMinutesUsedB.SECOND_HALF).toBe(0);
    expect(state.restMinutesUsedB.FIRST_HALF).toBe(1); // untouched
    expect(state.restMinutesUsedReferee.SECOND_HALF).toBe(0);
    expect(state.restMinutesUsedReferee.FIRST_HALF).toBe(0); // untouched
  });

  it('is a no-op outside an active half', () => {
    useGameStore.setState({
      phase: 'HALF_TIME',
      config: validConfig,
      playedTimeMs: 1000,
      restMinutesUsedA: { FIRST_HALF: 1, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
      restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
    });
    useGameStore.getState().resetCurrentHalf();
    expect(useGameStore.getState().playedTimeMs).toBe(1000); // unchanged
    expect(useGameStore.getState().restMinutesUsedA.FIRST_HALF).toBe(1); // unchanged
  });
});


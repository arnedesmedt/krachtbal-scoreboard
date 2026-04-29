import { create } from 'zustand';
import { emit } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { GameState, GameConfig, GameStateUpdatePayload, RestMinuteInitiator } from '../types/game';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const BROADCAST_CHANNEL_NAME = 'krachtbal-scoreboard';
const broadcastChannel =
  typeof window !== 'undefined' && !isTauri ? new BroadcastChannel(BROADCAST_CHANNEL_NAME) : null;

function safeEmit(event: string, payload: unknown) {
  if (isTauri) {
    emit(event, payload).catch(console.error);
  }
  broadcastChannel?.postMessage({ event, payload });
}

async function openPresentationWindow(label: string, url: string, title: string) {
  if (isTauri) {
    const existing = await WebviewWindow.getByLabel(label);
    if (existing) {
      await existing.setFocus();
    } else {
      new WebviewWindow(label, { url, title });
    }
  } else {
    // Append timestamp so a closed window can always be reopened
    window.open(url, '_blank');
  }
}

export type PresentationTheme = 'light' | 'dark'; // re-exported for convenience

let _playBuzzer: (() => void) | null = null;
export function setBuzzerFn(fn: () => void) { _playBuzzer = fn; }
function playBuzzer() { _playBuzzer?.(); }

const ACTIVE_HALVES = ['FIRST_HALF', 'SECOND_HALF'] as const;
type ActiveHalf = (typeof ACTIVE_HALVES)[number];
function isActiveHalf(phase: string): phase is ActiveHalf {
  return ACTIVE_HALVES.includes(phase as ActiveHalf);
}

const initialState: GameState = {
  phase: 'SETUP',
  config: null,
  scoreA: 0,
  scoreB: 0,
  penaltiesA: 0,
  penaltiesB: 0,
  playedTimeMs: 0,
  clockRunning: false,
  restMinute: null,
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
  presentationTheme: 'light',
  // Timing persistence fields
  halfStartTimeMs: null,
  restMinuteStartTimeMs: null,
  lastSavedTimeMs: null,
};

function buildPayload(state: GameState): GameStateUpdatePayload {
  const half = (state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF') ? state.phase : 'FIRST_HALF';
  const baseHalfMs = state.config ? state.config.halfTimeLengthMinutes * 60 * 1000 : 0;
  const totalRestMs = (
    state.restMinutesUsedA[half] +
    state.restMinutesUsedB[half] +
    state.restMinutesUsedReferee[half]
  ) * 60_000;
  const halfTimeLengthMs = baseHalfMs + totalRestMs;
  return {
    phase: state.phase,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
    penaltiesA: state.penaltiesA,
    penaltiesB: state.penaltiesB,
    playedTimeMs: state.playedTimeMs,
    halfTimeLengthMs,
    clockRunning: state.clockRunning,
    restMinute: state.restMinute,
    teamA: state.config
      ? { name: state.config.teamA.name, color: state.config.teamA.color, color2: state.config.teamA.color2 }
      : { name: '', color: '#ffffff', color2: '#ffffff' },
    teamB: state.config
      ? { name: state.config.teamB.name, color: state.config.teamB.color, color2: state.config.teamB.color2 }
      : { name: '', color: '#ffffff', color2: '#ffffff' },
    referee: state.config?.referee ?? '',
    league: state.config?.league ?? '',
    restMinutesUsedA: state.restMinutesUsedA,
    restMinutesUsedB: state.restMinutesUsedB,
    restMinutesUsedReferee: state.restMinutesUsedReferee,
    presentationTheme: state.presentationTheme,
  };
}

interface GameActions {
  setConfig: (config: GameConfig) => void;
  startGame: () => void;
  openPresentationWindows: () => void;
  openSinglePresentationWindow: () => void;
  togglePresentationTheme: () => void;
  toggleClock: () => void;
  adjustScore: (team: 'A' | 'B', delta: number) => void;
  addTeamPenalty: (team: 'A' | 'B') => void;
  startRestMinute: () => void;
  assignRestMinute: (initiator: RestMinuteInitiator) => void;
  cancelRestMinute: () => void;
  tickRestMinute: (deltaMs: number) => void;
  tickClock: (deltaMs: number) => void;
  clearRestMinute: () => void;
  startSecondHalf: () => void;
  resetGame: () => void;
  abandonGame: () => Promise<void>;
}

// Persistence functions
const saveGameState = (state: GameState) => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('localStorage not available, skipping save');
      return;
    }
    
    const stateToSave = {
      ...state,
      // Don't save setup phase - only save active games
      phase: state.phase === 'SETUP' ? 'SETUP' : state.phase,
      timestamp: Date.now()
    };
    console.log('Saving game state:', stateToSave);
    localStorage.setItem('krachtbal-game-state', JSON.stringify(stateToSave));
    console.log('Game state saved successfully');
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

const calculateElapsedTime = (state: Partial<GameState>): Partial<GameState> => {
  const now = Date.now();
  const updatedState = { ...state };
  
  // Calculate elapsed time for game clock
  if (state.clockRunning && state.halfStartTimeMs && state.lastSavedTimeMs) {
    const elapsedSinceSave = now - state.lastSavedTimeMs;
    updatedState.playedTimeMs = (state.playedTimeMs || 0) + elapsedSinceSave;
    updatedState.lastSavedTimeMs = now;
    console.log(`Restored clock: added ${elapsedSinceSave}ms to played time`);
  }
  
  // Calculate elapsed time for rest minute
  if (state.restMinute && state.restMinuteStartTimeMs && state.lastSavedTimeMs) {
    const elapsedSinceSave = now - state.lastSavedTimeMs;
    const newRemainingMs = Math.max(0, state.restMinute.remainingMs - elapsedSinceSave);
    updatedState.restMinute = {
      ...state.restMinute,
      remainingMs: newRemainingMs
    };
    updatedState.lastSavedTimeMs = now;
    console.log(`Restored rest minute: subtracted ${elapsedSinceSave}ms from remaining time`);
  }
  
  return updatedState;
};

const loadGameState = (): Partial<GameState> | null => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('localStorage not available, skipping load');
      return null;
    }
    
    const saved = localStorage.getItem('krachtbal-game-state');
    console.log('Loading game state, found:', saved ? 'data' : 'no data');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    console.log('Parsed game state:', parsed);
    // Only restore if it's not too old (e.g., within 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - parsed.timestamp > maxAge) {
      console.log('Game state too old, removing');
      localStorage.removeItem('krachtbal-game-state');
      return null;
    }
    
    // Calculate elapsed time since last save
    const stateWithElapsed = calculateElapsedTime(parsed);
    
    console.log('Game state loaded successfully with elapsed time calculated');
    return stateWithElapsed;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

const clearGameState = () => {
  try {
    localStorage.removeItem('krachtbal-game-state');
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => {
  // Try to load saved state on initialization
  const savedState = loadGameState();
  console.log('Store initialization - saved state:', savedState);
  const initialStateWithSaved = savedState ? { ...initialState, ...savedState } : initialState;
  console.log('Store initialization - initial state with saved:', initialStateWithSaved);
  
  return {
    ...initialStateWithSaved,

  setConfig(config) {
    if (get().phase !== 'SETUP') return;
    set({ config });
    safeEmit('game-state-update', buildPayload({ ...get(), config }));
  },

  startGame() {
    const state = get();
    if (state.phase !== 'SETUP') return;
    const { config } = state;
    if (!config) return;
    if (!config.teamA?.name || !config.teamB?.name || !config.referee) return;
    const now = Date.now();
    const newState = { 
      phase: 'FIRST_HALF' as const, 
      clockRunning: false,
      halfStartTimeMs: now,
      lastSavedTimeMs: now
    };
    set(newState);
    saveGameState({ ...get(), ...newState });
    safeEmit('game-state-update', buildPayload(get()));
  },

  openPresentationWindows() {
    const theme = get().presentationTheme;
    openPresentationWindow('presentation', `/#/presentation?theme=${theme}`, 'Scoreboard').catch(console.error);
  },

  openSinglePresentationWindow() {
    const theme = get().presentationTheme;
    openPresentationWindow('presentation', `/#/presentation?theme=${theme}`, 'Scoreboard').catch(console.error);
  },

  togglePresentationTheme() {
    set((s) => ({ presentationTheme: s.presentationTheme === 'light' ? 'dark' : 'light' }));
    safeEmit('game-state-update', buildPayload(get()));
  },

  toggleClock() {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    const now = Date.now();
    const isStarting = !state.clockRunning;
    
    if (isStarting) {
      // Starting the clock - set the start time if not already set
      set({ 
        clockRunning: true,
        halfStartTimeMs: state.halfStartTimeMs || now,
        lastSavedTimeMs: now
      });
    } else {
      // Stopping the clock - update the last saved time
      set({ 
        clockRunning: false,
        lastSavedTimeMs: now
      });
    }
    
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  adjustScore(team, delta) {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    if (team === 'A') {
      const newScore = state.scoreA + delta;
      if (newScore < 0) return;
      set({ scoreA: newScore });
    } else {
      const newScore = state.scoreB + delta;
      if (newScore < 0) return;
      set({ scoreB: newScore });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  addTeamPenalty(team) {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    if (team === 'A') {
      const next = (state.penaltiesA + 1) % 4; // 0→1→2→3→0
      set({ penaltiesA: next });
    } else {
      const next = (state.penaltiesB + 1) % 4;
      set({ penaltiesB: next });
    }
    safeEmit('game-state-update', buildPayload(get()));
  },

  // Start rest minute immediately (pending initiator assignment)
  startRestMinute() {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    if (state.restMinute !== null) return;
    if (!state.clockRunning) return;
    set({ restMinute: { initiatorTeam: null, remainingMs: 60_000, buzzerFired5s: false } });
    safeEmit('game-state-update', buildPayload(get()));
  },

  // Assign initiator after popup selection — increment counter immediately
  assignRestMinute(initiator) {
    const state = get();
    if (!state.restMinute) return;
    const half = state.phase as 'FIRST_HALF' | 'SECOND_HALF';
    const now = Date.now();
    set({
      restMinute: { ...state.restMinute, initiatorTeam: initiator },
      restMinuteStartTimeMs: now,
      lastSavedTimeMs: now,
      restMinutesUsedA: initiator === 'A'
        ? { ...state.restMinutesUsedA, [half]: state.restMinutesUsedA[half] + 1 }
        : state.restMinutesUsedA,
      restMinutesUsedB: initiator === 'B'
        ? { ...state.restMinutesUsedB, [half]: state.restMinutesUsedB[half] + 1 }
        : state.restMinutesUsedB,
      restMinutesUsedReferee: initiator === 'referee'
        ? { ...state.restMinutesUsedReferee, [half]: state.restMinutesUsedReferee[half] + 1 }
        : state.restMinutesUsedReferee,
    });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  // Cancel a pending or active rest minute
  cancelRestMinute() {
    const state = get();
    if (!state.restMinute) return;
    set({ restMinute: null });
    safeEmit('game-state-update', buildPayload(get()));
  },

  tickRestMinute(deltaMs) {
    const state = get();
    if (!state.restMinute) return;
    const remaining = state.restMinute.remainingMs - deltaMs;
    const now = Date.now();
    
    if (remaining <= 0) {
      get().clearRestMinute();
    } else {
      // Fire 5-second buzzer once — trigger slightly early to compensate for audio output latency
      const crossed5s = !state.restMinute.buzzerFired5s && remaining <= 5_150;
      if (crossed5s) playBuzzer();
      set({ 
        restMinute: { 
          ...state.restMinute, 
          remainingMs: remaining, 
          buzzerFired5s: state.restMinute.buzzerFired5s || crossed5s 
        },
        lastSavedTimeMs: now
      });
      safeEmit('game-state-update', buildPayload(get()));
    }
  },

  clearRestMinute() {
    const state = get();
    if (!state.restMinute) return;
    // Counter was already incremented in assignRestMinute; just clear the rest minute
    set({ restMinute: null });
    safeEmit('game-state-update', buildPayload(get()));
  },

  tickClock(deltaMs) {
    const state = get();
    if (!state.clockRunning) return;
    if (!isActiveHalf(state.phase)) return;
    const half = state.phase;
    const baseHalfMs = (state.config?.halfTimeLengthMinutes ?? 0) * 60 * 1000;
    const totalRestMs = (
      state.restMinutesUsedA[half] +
      state.restMinutesUsedB[half] +
      state.restMinutesUsedReferee[half]
    ) * 60_000;
    const halfTimeLengthMs = baseHalfMs + totalRestMs;
    const newTime = state.playedTimeMs + deltaMs;
    // Fire 1-minute warning buzzer when crossing the 1-minute-remaining threshold
    // Only if no rest minute is currently active
    const threshold1m = halfTimeLengthMs - 60_000;
    if (threshold1m > 0 && state.playedTimeMs < threshold1m && newTime >= threshold1m && !state.restMinute) {
      playBuzzer();
    }
    if (newTime >= halfTimeLengthMs && halfTimeLengthMs > 0) {
      const now = Date.now();
      if (state.phase === 'FIRST_HALF') {
        playBuzzer();
        set({ 
          playedTimeMs: halfTimeLengthMs, 
          clockRunning: false, 
          phase: 'HALF_TIME',
          lastSavedTimeMs: now
        });
      } else if (state.phase === 'SECOND_HALF') {
        playBuzzer();
        set({ 
          playedTimeMs: halfTimeLengthMs, 
          clockRunning: false, 
          phase: 'ENDED',
          lastSavedTimeMs: now
        });
      }
    } else {
      const now = Date.now();
      set({ 
        playedTimeMs: newTime,
        lastSavedTimeMs: now
      });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  startSecondHalf() {
    if (get().phase !== 'HALF_TIME') return;
    const now = Date.now();
    set({ 
      phase: 'SECOND_HALF', 
      playedTimeMs: 0, 
      clockRunning: false,
      halfStartTimeMs: now,
      lastSavedTimeMs: now
    });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  async resetGame() {
    const state = get();
    if (state.phase !== 'ENDED') return;
    if (isTauri) {
      const win = await WebviewWindow.getByLabel('presentation');
      await win?.close();
    }
    set({ ...initialState });
    clearGameState(); // Clear saved state when game is reset
    safeEmit('game-state-update', buildPayload(get()));
  },

  async abandonGame() {
    if (isTauri) {
      const win = await WebviewWindow.getByLabel('presentation');
      await win?.close();
    }
    set({ ...initialState });
    clearGameState(); // Clear saved state when game is abandoned
    safeEmit('game-state-update', buildPayload(get()));
  },
  };
});

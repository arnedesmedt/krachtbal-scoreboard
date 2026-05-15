import { create } from 'zustand';
import { emit } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { GameState, GameConfig, GameStateUpdatePayload, RestMinuteInitiator, PenaltyShootoutState, PenaltyBulletState } from '../types/game';

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

const ACTIVE_HALVES = ['FIRST_HALF', 'SECOND_HALF', 'THIRD_HALF', 'FOURTH_HALF'] as const;
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
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  presentationTheme: 'light',
  halvesPlayed: [],
  penaltyShootout: null,
  // Timing persistence fields
  halfStartTimeMs: null,
  restMinuteStartTimeMs: null,
  lastSavedTimeMs: null,
};

function buildPayload(state: GameState): GameStateUpdatePayload {
  let half: keyof typeof state.restMinutesUsedA;
  let baseHalfMs: number;
  
  if (state.phase === 'THIRD_HALF' || state.phase === 'FOURTH_HALF') {
    half = state.phase;
    baseHalfMs = 5 * 60 * 1000; // 5 minutes for 3rd and 4th halves
  } else {
    half = (state.phase === 'FIRST_HALF' || state.phase === 'SECOND_HALF') ? state.phase : 'FIRST_HALF';
    baseHalfMs = state.config ? state.config.halfTimeLengthMinutes * 60 * 1000 : 0;
  }
  
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
    penaltyShootout: state.penaltyShootout,
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
  removeTeamPenalty: (team: 'A' | 'B') => void;
  setPenalties: (team: 'A' | 'B', count: number) => void;
  resetCurrentHalf: () => void;
  startRestMinute: () => void;
  assignRestMinute: (initiator: RestMinuteInitiator) => void;
  cancelRestMinute: () => void;
  tickRestMinute: (deltaMs: number) => void;
  tickClock: (deltaMs: number) => void;
  clearRestMinute: () => void;
  startSecondHalf: () => void;
  startThirdHalf: () => void;
  startFourthHalf: () => void;
  startPenaltyShootout: () => void;
  setPenaltyBullet: (team: 'A' | 'B', roundIndex: number, state: PenaltyBulletState) => void;
  nextPenaltyRound: () => void;
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
    
    // Ensure halvesPlayed field exists (for backward compatibility)
    if (!stateWithElapsed.halvesPlayed) {
      stateWithElapsed.halvesPlayed = [];
    }
    
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
  console.log('Store initialization - halvesPlayed:', initialStateWithSaved.halvesPlayed);
  
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
    console.log('adjustScore called:', { team, delta, phase: state.phase, restMinute: state.restMinute });
    // Allow score changes during active halves, half-time, during rest minutes, and after game ends
    // Prevent during SETUP phase only
    if (state.phase === 'SETUP') {
      console.log('adjustScore blocked: not allowed phase');
      return;
    }
    if (team === 'A') {
      const newScore = state.scoreA + delta;
      if (newScore < 0) return;
      console.log('adjustScore setting scoreA:', newScore);
      set({ scoreA: newScore });
    } else {
      const newScore = state.scoreB + delta;
      if (newScore < 0) return;
      console.log('adjustScore setting scoreB:', newScore);
      set({ scoreB: newScore });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  addTeamPenalty(team) {
    const state = get();
    console.log('addTeamPenalty called:', { team, phase: state.phase, restMinute: state.restMinute });
    // Allow penalty changes during active halves, half-time, during rest minutes, and after game ends
    // Prevent during SETUP phase only
    if (state.phase === 'SETUP') {
      console.log('addTeamPenalty blocked: not allowed phase');
      return;
    }
    if (team === 'A') {
      const next = (state.penaltiesA + 1) % 4; // 0→1→2→3→0
      console.log('addTeamPenalty setting penaltiesA:', next);
      set({ penaltiesA: next });
    } else {
      const next = (state.penaltiesB + 1) % 4;
      console.log('addTeamPenalty setting penaltiesB:', next);
      set({ penaltiesB: next });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  removeTeamPenalty(team) {
    const state = get();
    if (state.phase === 'SETUP') return;
    if (team === 'A') {
      set({ penaltiesA: Math.max(0, state.penaltiesA - 1) });
    } else {
      set({ penaltiesB: Math.max(0, state.penaltiesB - 1) });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  setPenalties(team, count) {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    if (team === 'A') {
      set({ penaltiesA: Math.max(0, Math.min(3, count)) });
    } else {
      set({ penaltiesB: Math.max(0, Math.min(3, count)) });
    }
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  resetCurrentHalf() {
    const state = get();
    if (!isActiveHalf(state.phase)) return;
    
    const now = Date.now();
    set({
      playedTimeMs: 0,
      clockRunning: false,
      halfStartTimeMs: now,
      lastSavedTimeMs: now,
      restMinute: null
    });
    
    saveGameState(get());
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
    let baseHalfMs: number;
    
    if (half === 'THIRD_HALF' || half === 'FOURTH_HALF') {
      baseHalfMs = 5 * 60 * 1000; // 5 minutes for 3rd and 4th halves
    } else {
      baseHalfMs = (state.config?.halfTimeLengthMinutes ?? 0) * 60 * 1000;
    }
    
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
          halvesPlayed: [...state.halvesPlayed, 'FIRST_HALF'],
          lastSavedTimeMs: now
        });
        saveGameState(get());
      } else if (state.phase === 'SECOND_HALF') {
        playBuzzer();
        set({ 
          playedTimeMs: halfTimeLengthMs, 
          clockRunning: false, 
          phase: 'ENDED',
          halvesPlayed: [...state.halvesPlayed, 'SECOND_HALF'],
          lastSavedTimeMs: now
        });
        saveGameState(get());
      } else if (state.phase === 'THIRD_HALF') {
        playBuzzer();
        set({ 
          playedTimeMs: halfTimeLengthMs, 
          clockRunning: false, 
          phase: 'ENDED',
          halvesPlayed: [...state.halvesPlayed, 'THIRD_HALF'],
          lastSavedTimeMs: now
        });
        saveGameState(get());
      } else if (state.phase === 'FOURTH_HALF') {
        playBuzzer();
        const isTied = state.scoreA === state.scoreB;
        set({ 
          playedTimeMs: halfTimeLengthMs, 
          clockRunning: false, 
          phase: isTied ? 'ENDED' : 'ENDED', // Still ENDED, but UI will check for tie
          halvesPlayed: [...state.halvesPlayed, 'FOURTH_HALF'],
          lastSavedTimeMs: now
        });
        saveGameState(get());
      }
    } else {
      const now = Date.now();
      set({ 
        playedTimeMs: newTime,
        lastSavedTimeMs: now
      });
    }
    // Only emit state update for clock, don't save to localStorage continuously
    safeEmit('game-state-update', buildPayload(get()));
  },

  startSecondHalf() {
    if (get().phase !== 'HALF_TIME') return;
    const now = Date.now();
    set({ 
      phase: 'SECOND_HALF', 
      playedTimeMs: 0, 
      clockRunning: true,
      halfStartTimeMs: now,
      lastSavedTimeMs: now
    });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  startThirdHalf() {
    const state = get();
    if (state.phase !== 'ENDED') return;
    if (state.scoreA !== state.scoreB) return; // Only allow if scores are equal
    const now = Date.now();
    set({ 
      phase: 'THIRD_HALF', 
      playedTimeMs: 0, 
      clockRunning: true,
      halfStartTimeMs: now,
      lastSavedTimeMs: now
    });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  startFourthHalf() {
    const state = get();
    if (state.phase !== 'ENDED') return;
    // 4th half always appears if 3rd half was played, regardless of score equality
    const now = Date.now();
    set({ 
      phase: 'FOURTH_HALF', 
      playedTimeMs: 0, 
      clockRunning: true,
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

  startPenaltyShootout() {
    const state = get();
    if (state.phase !== 'ENDED') return;
    if (state.scoreA !== state.scoreB) return; // Only allow if scores are equal
    
    const penaltyShootout: PenaltyShootoutState = {
      bulletsA: Array(4).fill('pending' as PenaltyBulletState),
      bulletsB: Array(4).fill('pending' as PenaltyBulletState),
      currentRound: 1,
      suddenDeath: false,
    };
    
    set({ phase: 'PENALTY_SHOOTOUT', penaltyShootout });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  setPenaltyBullet(team, roundIndex, state) {
    const current = get();
    if (!current.penaltyShootout) return;
    if (roundIndex >= current.penaltyShootout.bulletsA.length) return;
    
    const updatedShootout = { ...current.penaltyShootout };
    if (team === 'A') {
      updatedShootout.bulletsA = [...updatedShootout.bulletsA];
      updatedShootout.bulletsA[roundIndex] = state;
    } else {
      updatedShootout.bulletsB = [...updatedShootout.bulletsB];
      updatedShootout.bulletsB[roundIndex] = state;
    }
    
    const scoredA = updatedShootout.bulletsA.filter(b => b === 'scored').length;
    const scoredB = updatedShootout.bulletsB.filter(b => b === 'scored').length;
    const decidedA = updatedShootout.bulletsA.filter(b => b !== 'pending').length;
    const decidedB = updatedShootout.bulletsB.filter(b => b !== 'pending').length;

    // Early termination: if one team can no longer win even with all remaining shots
    if (!updatedShootout.suddenDeath) {
      const totalRounds = 4;
      const maxA = scoredA + (totalRounds - decidedA);
      const maxB = scoredB + (totalRounds - decidedB);
      if (scoredA > maxB || scoredB > maxA) {
        set({ penaltyShootout: { ...updatedShootout, currentRound: Math.max(decidedA, decidedB) }, phase: 'ENDED' });
        saveGameState(get());
        safeEmit('game-state-update', buildPayload(get()));
        return;
      }
    }

    // Check if a round just completed (both teams have the same number of decided bullets)
    const assignedA = decidedA;
    const assignedB = decidedB;
    
    if (assignedA === assignedB) {
      const completedRound = assignedA;
      
      if (completedRound >= 4) {
        
        if (scoredA !== scoredB) {
          // Winner determined — end the game
          set({ penaltyShootout: { ...updatedShootout, currentRound: completedRound }, phase: 'ENDED' });
          saveGameState(get());
          safeEmit('game-state-update', buildPayload(get()));
          return;
        } else {
          // Still tied — add one more bullet for each team (sudden death)
          updatedShootout.bulletsA = [...updatedShootout.bulletsA, 'pending' as PenaltyBulletState];
          updatedShootout.bulletsB = [...updatedShootout.bulletsB, 'pending' as PenaltyBulletState];
          updatedShootout.suddenDeath = true;
          updatedShootout.currentRound = completedRound + 1;
        }
      } else {
        // Round 1–3 complete — advance currentRound for display
        updatedShootout.currentRound = completedRound + 1;
      }
    }
    
    set({ penaltyShootout: updatedShootout });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },

  nextPenaltyRound() {
    const current = get();
    if (!current.penaltyShootout) return;
    
    const shootout = current.penaltyShootout;
    const scoredA = shootout.bulletsA.filter(b => b === 'scored').length;
    const scoredB = shootout.bulletsB.filter(b => b === 'scored').length;
    
    // Check if we have a winner after initial 4 rounds
    if (!shootout.suddenDeath && shootout.currentRound >= 4) {
      if (scoredA !== scoredB) {
        // Game ends, winner determined by penalty shootout
        set({ phase: 'ENDED' });
        saveGameState(get());
        safeEmit('game-state-update', buildPayload(get()));
        return;
      } else {
        // Enter sudden death
        const updatedShootout = {
          ...shootout,
          suddenDeath: true,
          currentRound: shootout.currentRound + 1,
          bulletsA: [...shootout.bulletsA, 'pending' as PenaltyBulletState],
          bulletsB: [...shootout.bulletsB, 'pending' as PenaltyBulletState],
        };
        set({ penaltyShootout: updatedShootout });
        saveGameState(get());
        safeEmit('game-state-update', buildPayload(get()));
        return;
      }
    }
    
    // Check for sudden death winner
    if (shootout.suddenDeath && shootout.currentRound > 4) {
      const currentRoundScoredA = shootout.bulletsA[shootout.currentRound - 1] === 'scored' ? 1 : 0;
      const currentRoundScoredB = shootout.bulletsB[shootout.currentRound - 1] === 'scored' ? 1 : 0;
      
      if (currentRoundScoredA !== currentRoundScoredB) {
        // Game ends, winner determined by sudden death
        set({ phase: 'ENDED' });
        saveGameState(get());
        safeEmit('game-state-update', buildPayload(get()));
        return;
      }
    }
    
    // Move to next round
    const updatedShootout = {
      ...shootout,
      currentRound: shootout.currentRound + 1,
    };
    
    // Add new bullets for sudden death rounds
    if (shootout.suddenDeath && updatedShootout.currentRound > shootout.bulletsA.length) {
      updatedShootout.bulletsA = [...shootout.bulletsA, 'pending' as PenaltyBulletState];
      updatedShootout.bulletsB = [...shootout.bulletsB, 'pending' as PenaltyBulletState];
    }
    
    set({ penaltyShootout: updatedShootout });
    saveGameState(get());
    safeEmit('game-state-update', buildPayload(get()));
  },
  };
});

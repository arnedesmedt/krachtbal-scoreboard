import { listen, emit } from '@tauri-apps/api/event';
import { useGameStore } from './gameStore';
import { BROADCAST_CHANNEL_NAME } from './gameStore';
import type { GameStateUpdatePayload } from '../types/game';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

/**
 * Set up sync listener: respond to request-state-sync from presentation windows.
 * Called once at app startup in the control window.
 */
export async function setupSyncListener() {
  if (isTauri) {
    await listen<{ windowLabel: string }>('request-state-sync', (event) => {
      const state = useGameStore.getState();
      const payload: GameStateUpdatePayload = buildPayloadFromStore(state);
      emit('state-sync-response', payload);
      void event; // label routing handled by Tauri broadcast
    });
  } else {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent<{ event: string; payload: unknown }>) => {
      if (e.data.event === 'request-state-sync') {
        const payload = buildPayloadFromStore(useGameStore.getState());
        channel.postMessage({ event: 'state-sync-response', payload });
      }
    };
  }
}

function buildPayloadFromStore(state: ReturnType<typeof useGameStore.getState>): GameStateUpdatePayload {
  const halfTimeLengthMs = state.config ? state.config.halfTimeLengthMinutes * 60 * 1000 : 0;
  return {
    phase: state.phase,
    scoreA: state.scoreA,
    scoreB: state.scoreB,
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
  };
}

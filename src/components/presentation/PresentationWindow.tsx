import { useEffect, useState } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import type { GameStateUpdatePayload } from '../../types/game';
import { BROADCAST_CHANNEL_NAME } from '../../store/gameStore';
import { ScoreBoard } from './ScoreBoard';
import { TimerDisplay } from './TimerDisplay';
import { RestMinuteDisplay } from './RestMinuteDisplay';
import { RestMinuteCounters } from './RestMinuteCounters';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const DEFAULT_PAYLOAD: GameStateUpdatePayload = {
  phase: 'SETUP',
  scoreA: 0,
  scoreB: 0,
  playedTimeMs: 0,
  halfTimeLengthMs: 0,
  clockRunning: false,
  restMinute: null,
  teamA: { name: 'Team A', color: '#ef4444', color2: '#ffffff' },
  teamB: { name: 'Team B', color: '#3b82f6', color2: '#ffffff' },
  referee: '',
  league: '',
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0 },
};

export default function PresentationWindow() {
  const [state, setState] = useState<GameStateUpdatePayload>(DEFAULT_PAYLOAD);
  const windowLabel = 'presentation';

  useEffect(() => {
    if (isTauri) {
      let unlistenUpdate: (() => void) | undefined;
      let unlistenSync: (() => void) | undefined;

      const setup = async () => {
        try {
          await emit('request-state-sync', { windowLabel });
          unlistenUpdate = await listen<GameStateUpdatePayload>('game-state-update', (event) => {
            setState(event.payload);
          });
          unlistenSync = await listen<GameStateUpdatePayload>('state-sync-response', (event) => {
            setState(event.payload);
          });
        } catch (_err) {
          emit('request-state-sync', { windowLabel }).catch(() => undefined);
        }
      };

      setup();
      return () => { unlistenUpdate?.(); unlistenSync?.(); };
    } else {
      // Browser mode: use BroadcastChannel
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (e: MessageEvent<{ event: string; payload: GameStateUpdatePayload }>) => {
        if (e.data.event === 'game-state-update' || e.data.event === 'state-sync-response') {
          setState(e.data.payload);
        }
      };
      // Request current state from the control window
      channel.postMessage({ event: 'request-state-sync', payload: { windowLabel } });
      return () => channel.close();
    }
  }, []);

  const hasRestMinute = !!state.restMinute;

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col p-8 overflow-hidden" style={{ gap: '3vh' }}>
      <ScoreBoard payload={state} />
      <div className="flex-1 flex items-center justify-center">
        {hasRestMinute ? (
          <RestMinuteDisplay payload={state} />
        ) : (
          <TimerDisplay payload={state} />
        )}
      </div>
      <RestMinuteCounters payload={state} />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { GameStateUpdatePayload } from '../../types/game';
import { BROADCAST_CHANNEL_NAME } from '../../store/gameStore';
import { ScoreBoard } from './ScoreBoard';
import { TimerDisplay } from './TimerDisplay';
import { RestMinuteDisplay } from './RestMinuteDisplay';

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

const DEFAULT_PAYLOAD: GameStateUpdatePayload = {
  phase: 'SETUP',
  scoreA: 0,
  scoreB: 0,
  penaltiesA: 0,
  penaltiesB: 0,
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
  presentationTheme: 'light',
};

export default function PresentationWindow() {
  const [state, setState] = useState<GameStateUpdatePayload>(DEFAULT_PAYLOAD);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const windowLabel = 'presentation';

  const toggleFullscreen = useCallback(async () => {
    if (isTauri) {
      const win = await WebviewWindow.getByLabel('presentation');
      if (win) {
        const current = await win.isFullscreen();
        await win.setFullscreen(!current);
        setIsFullscreen(!current);
      }
    } else {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  }, []);

  const theme = state.presentationTheme ?? 'light';

  useEffect(() => {
    if (isTauri) {
      let unlistenUpdate: (() => void) | undefined;
      let unlistenSync: (() => void) | undefined;

      const setup = async () => {
        try {
          // Set up listeners BEFORE requesting sync so the response isn't missed
          unlistenUpdate = await listen<GameStateUpdatePayload>('game-state-update', (event) => {
            setState(event.payload);
          });
          unlistenSync = await listen<GameStateUpdatePayload>('state-sync-response', (event) => {
            setState(event.payload);
          });
          await emit('request-state-sync', { windowLabel });
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
    <div
      className={`h-screen flex flex-col p-8 overflow-hidden ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}
      style={{ gap: '3vh' }}
    >
      {!isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Volledig scherm"
          style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
            background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.7rem',
            cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1,
            color: theme === 'dark' ? '#fff' : '#333',
          }}
          aria-label="Volledig scherm"
        >
          ⛶
        </button>
      )}
      <ScoreBoard payload={state} theme={theme} />
      <div className="flex-1 flex items-center justify-center">
        {hasRestMinute ? (
          <RestMinuteDisplay payload={state} />
        ) : (
          <TimerDisplay payload={state} theme={theme} />
        )}
      </div>
    </div>
  );
}

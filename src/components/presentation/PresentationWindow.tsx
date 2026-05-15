import { useEffect, useState, useCallback } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { GameStateUpdatePayload } from '../../types/game';
import { BROADCAST_CHANNEL_NAME } from '../../store/gameStore';
import { ScoreBoard } from './ScoreBoard';
import { phaseLabel } from '../../utils/gamePhaseLabel';
import { formatMs } from '../../utils/formatTime';

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
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  presentationTheme: 'light',
  penaltyShootout: null,
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

  const isDark = theme === 'dark';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className={`h-screen flex flex-col px-[3vh] py-[3vh] overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-950 via-slate-900 to-indigo-950 text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'}`}
    >
      {!isFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Volledig scherm"
          style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            border: 'none', borderRadius: '0.5rem', padding: '0.4rem 0.7rem',
            cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1,
            color: isDark ? '#fff' : '#333',
          }}
          aria-label="Volledig scherm"
        >
          ⛶
        </button>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between flex-shrink-0 mb-[3vh]">
        {/* Left: league + phase */}
        <div className="flex items-center gap-[1.5vw]">
          {state.league && (
            <span
              className={`font-bold uppercase tracking-wider ${textMuted}`}
              style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}
            >
              {state.league}
            </span>
          )}
          <span
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold shadow-md"
            style={{ fontSize: 'clamp(1.2rem, 3vw, 2.2rem)', padding: '0.8vh 3vw' }}
          >
            {phaseLabel(state.phase)}
          </span>
        </div>

        {/* Right: rest minute (if active) + clock */}
        <div className="flex items-center" style={{ gap: 'clamp(1rem, 2.5vw, 2.5rem)' }}>
          {state.restMinute && (
            <div className="flex items-center" style={{ gap: 'clamp(0.8rem, 1.5vw, 1.5rem)' }}>
              <div className="flex items-center" style={{ gap: 'clamp(0.4rem, 0.8vw, 0.8rem)' }}>
                <div
                  className="rounded-full flex-shrink-0 bg-red-500 shadow-lg animate-pulse"
                  style={{ width: 'clamp(10px, 1.4vw, 18px)', height: 'clamp(10px, 1.4vw, 18px)' }}
                />
                <div
                  className="font-mono font-black tracking-widest leading-none"
                  style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', color: '#f97316' }}
                >
                  {formatMs(state.restMinute.remainingMs)}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center" style={{ gap: 'clamp(0.5rem, 1vw, 1rem)' }}>
            <div
              className={`rounded-full flex-shrink-0 transition-all duration-500 ${
                state.clockRunning
                  ? 'bg-green-500 shadow-lg animate-pulse'
                  : isDark ? 'bg-white/20' : 'bg-gray-300'
              }`}
              style={{ width: 'clamp(14px, 2.2vw, 28px)', height: 'clamp(14px, 2.2vw, 28px)' }}
            />
            <div
              className={`font-mono font-black tracking-widest leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontSize: 'clamp(4rem, 11vw, 11rem)' }}
            >
              {formatMs(state.playedTimeMs)}
            </div>
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="mt-[2vh]">
        <ScoreBoard payload={state} theme={theme} />
      </div>
    </div>
  );
}

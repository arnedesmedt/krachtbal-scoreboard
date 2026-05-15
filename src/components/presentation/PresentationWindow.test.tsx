import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import PresentationWindow from './PresentationWindow';
import type { GameStateUpdatePayload } from '../../types/game';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

const samplePayload: GameStateUpdatePayload = {
  phase: 'FIRST_HALF',
  scoreA: 2,
  scoreB: 1,
  penaltiesA: 0,
  penaltiesB: 0,
  playedTimeMs: 5000,
  halfTimeLengthMs: 1200000,
  clockRunning: true,
  restMinute: null,
  teamA: { name: 'Eagles', color: '#ff0000', color2: '#ffffff' },
  teamB: { name: 'Lions', color: '#0000ff', color2: '#ffffff' },
  referee: 'Ref Sam',
  league: 'National League A',
  restMinutesUsedA: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedB: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  restMinutesUsedReferee: { FIRST_HALF: 0, SECOND_HALF: 0, THIRD_HALF: 0, FOURTH_HALF: 0 },
  presentationTheme: "light",
  penaltyShootout: null,
};

// Track BroadcastChannel instances created during tests
let channels: { onmessage: ((e: MessageEvent) => void) | null; postMessage: ReturnType<typeof vi.fn>; close: ReturnType<typeof vi.fn> }[] = [];

beforeEach(() => {
  channels = [];
  (window as unknown as Record<string, unknown>).BroadcastChannel = vi.fn().mockImplementation(() => {
    const ch = { onmessage: null as ((e: MessageEvent) => void) | null, postMessage: vi.fn(), close: vi.fn() };
    channels.push(ch);
    return ch;
  });
});

describe('PresentationWindow', () => {
  it('sends request-state-sync on mount via BroadcastChannel', async () => {
    render(<PresentationWindow />);
    await act(async () => {});
    const channel = channels[channels.length - 1];
    expect(channel.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'request-state-sync' })
    );
  });

  it('re-renders after game-state-update message', async () => {
    render(<PresentationWindow />);
    await act(async () => {});
    const channel = channels[channels.length - 1];

    act(() => {
      channel.onmessage?.({ data: { event: 'game-state-update', payload: samplePayload } } as MessageEvent);
    });

    expect(screen.getAllByText(/Eagles/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lions/i).length).toBeGreaterThan(0);
  });
});

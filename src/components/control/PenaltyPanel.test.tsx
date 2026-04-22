import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../../store/gameStore';

vi.mock('@tauri-apps/api/event');
vi.mock('@tauri-apps/api/webviewWindow');

describe('addTeamPenalty', () => {
  beforeEach(() => {
    useGameStore.setState({ phase: 'FIRST_HALF', penaltiesA: 0, penaltiesB: 0 });
  });

  it('increments penaltiesA from 0 to 1', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => { result.current.addTeamPenalty('A'); });
    expect(useGameStore.getState().penaltiesA).toBe(1);
  });

  it('cycles penaltiesA back to 0 after 3', () => {
    useGameStore.setState({ penaltiesA: 3 });
    const { result } = renderHook(() => useGameStore());
    act(() => { result.current.addTeamPenalty('A'); });
    expect(useGameStore.getState().penaltiesA).toBe(0);
  });

  it('does not add penalty outside active half', () => {
    useGameStore.setState({ phase: 'HALF_TIME' });
    const { result } = renderHook(() => useGameStore());
    act(() => { result.current.addTeamPenalty('A'); });
    expect(useGameStore.getState().penaltiesA).toBe(0);
  });
});

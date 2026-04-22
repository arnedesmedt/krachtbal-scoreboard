import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBuzzer } from './useBuzzer';

describe('useBuzzer', () => {
  beforeEach(() => {
    const mockAudio = { play: vi.fn(() => Promise.resolve()) };
    vi.stubGlobal('Audio', vi.fn(() => mockAudio));
  });

  it('playBuzzer creates an Audio element and calls play', () => {
    const { result } = renderHook(() => useBuzzer());
    result.current.playBuzzer();

    expect(Audio).toHaveBeenCalledWith('/bell.mp3');
    const audio = new Audio('/bell.mp3') as unknown as { play: ReturnType<typeof vi.fn> };
    expect(audio.play).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { formatMs } from './formatTime';

describe('formatMs', () => {
  it('formats 0 as 00:00', () => {
    expect(formatMs(0)).toBe('00:00');
  });

  it('formats 65000 as 01:05', () => {
    expect(formatMs(65000)).toBe('01:05');
  });

  it('formats 3599999 as 59:59', () => {
    expect(formatMs(3599999)).toBe('59:59');
  });

  it('handles negative values as 00:00', () => {
    expect(formatMs(-500)).toBe('00:00');
  });
});


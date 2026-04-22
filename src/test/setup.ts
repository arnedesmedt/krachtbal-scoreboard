import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.open so tests that call startGame don't throw
Object.defineProperty(window, 'open', { value: vi.fn(), writable: true });

// Mock BroadcastChannel
class MockBroadcastChannel {
  onmessage: ((e: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  close = vi.fn();
}
Object.defineProperty(window, 'BroadcastChannel', { value: MockBroadcastChannel, writable: true });

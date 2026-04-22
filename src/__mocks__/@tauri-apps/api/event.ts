import { vi } from 'vitest';

type Listener = (event: { payload: unknown }) => void;
const listeners: Record<string, Listener[]> = {};

export const emit = vi.fn((_eventName: string, _payload?: unknown) => Promise.resolve());

export const listen = vi.fn((eventName: string, handler: Listener) => {
  if (!listeners[eventName]) listeners[eventName] = [];
  listeners[eventName].push(handler);
  return Promise.resolve(() => {
    listeners[eventName] = listeners[eventName].filter((h) => h !== handler);
  });
});

/** Test helper: fire an event manually */
export function __fireEvent(eventName: string, payload: unknown) {
  (listeners[eventName] ?? []).forEach((h) => h({ payload }));
}

export function __reset() {
  Object.keys(listeners).forEach((k) => delete listeners[k]);
  emit.mockClear();
  listen.mockClear();
}


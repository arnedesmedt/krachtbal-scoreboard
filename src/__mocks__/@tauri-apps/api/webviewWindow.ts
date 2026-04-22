import { vi } from 'vitest';

const windows: Record<string, { close: ReturnType<typeof vi.fn> }> = {};

export class WebviewWindow {
  label: string;
  close = vi.fn(() => Promise.resolve());

  constructor(label: string, _options?: unknown) {
    this.label = label;
    windows[label] = this;
  }

  static getByLabel(label: string) {
    return Promise.resolve(windows[label] ?? null);
  }

  static __reset() {
    Object.keys(windows).forEach((k) => delete windows[k]);
  }

  static __getAll() {
    return Object.values(windows);
  }
}


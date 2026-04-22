# Research: Krachtbal Scoreboard

## Technology Stack

### Decision: Tauri 2 + React 18 + TypeScript
- **Decision**: Use Tauri 2 as the application shell with React 18 + TypeScript for the UI layer.
- **Rationale**: Tauri produces single native binaries for Linux and Windows with a minimal footprint (<10 MB). React + TypeScript is widely supported, has a mature testing ecosystem (Vitest + React Testing Library), and offers excellent component-driven UI development. Tauri 2 natively supports multiple windows, making presentation window management straightforward.
- **Alternatives considered**:
  - *Electron*: Much larger binary (~100 MB+), higher memory usage, overkill for this use case.
  - *Svelte/SvelteKit + Tauri*: Lighter bundle but smaller ecosystem; React preferred for testing maturity.
  - *Flutter*: Cross-platform but not a single binary for desktop in the same sense; Tauri is a better fit.

### Decision: Zustand for State Management
- **Decision**: Zustand (lightweight global store).
- **Rationale**: Minimal boilerplate, supports derived state well, easy to test. Game state is effectively a single shared store; no need for Redux complexity.
- **Alternatives considered**: Redux Toolkit (overkill), Jotai (atoms add complexity for this use case), React Context (performance concerns with frequent timer ticks).

### Decision: Tauri Event System for Multi-Window Sync
- **Decision**: Tauri's built-in `emit` / `listen` IPC event system for broadcasting state from the control window to all presentation windows.
- **Rationale**: Tauri 2 supports emitting events globally to all windows via `emit_to` (Rust backend) or `emit` (JS frontend with `window.__TAURI__.event`). This gives sub-100 ms sync latency on localhost (well within the 1-second SC-002 requirement).
- **Alternatives considered**: WebSockets (adds complexity, requires a server process), SharedWorker (browser-only), Tauri channels (lower-level, event system sufficient here).

### Decision: Vitest + React Testing Library for Testing
- **Decision**: Vitest as the test runner with React Testing Library for component tests.
- **Rationale**: Vitest integrates natively with Vite (Tauri's frontend bundler), offers Jest-compatible API, and runs fast. RTL encourages testing user-visible behavior.
- **Alternatives considered**: Jest (slower with Vite, requires extra config), Playwright (used for E2E, not unit tests).

### Decision: ESLint + Prettier for Linting
- **Decision**: ESLint with `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, and Prettier for formatting.
- **Rationale**: Standard in the React/TypeScript ecosystem. Covers constitution requirement II (linting enforcement).
- **Alternatives considered**: Biome (fast but less plugin ecosystem maturity).

### Decision: Audio via Web Audio API
- **Decision**: Use the Web Audio API (browser-native) to synthesize buzzer sounds.
- **Rationale**: No external dependency; works in any Tauri WebView. A short oscillator-based beep is sufficient for half-time/end-time/rest-minute buzzers.
- **Alternatives considered**: Tauri fs + <audio> element with bundled mp3 (adds binary size; Web Audio is simpler).

### Decision: Penalties Tracked Per Player Number on Team
- **Decision**: Penalties are stored as a count on `Player.penalties` keyed by player number within a team. Substitutions do not affect penalty counts because numbers stay with players (per spec FR-010).
- **Rationale**: Directly matches spec requirement FR-010 and edge case clarification.

### Decision: Presentation Windows as Named Tauri Windows
- **Decision**: Presentation windows are Tauri `WebviewWindow` instances created at game start, named `presentation-0`, `presentation-1`, etc.
- **Rationale**: Tauri 2 supports creating/closing windows programmatically from JS. Each window loads the same Vite route (`/presentation`) and subscribes to state events. On close-and-reopen, the window re-subscribes and receives the current snapshot (FR-008).
- **Alternatives considered**: Browser popups (limited control), iframes (same-window only).

### Decision: Number of Presentation Windows – Pre-game Only
- **Decision**: `numPresentationWindows` is part of `GameConfig` and is locked once the game starts (FR-011).
- **Rationale**: Matches spec. Changing mid-game would require teardown/recreate logic with no benefit.

### Decision: Single Controller (FR-012)
- **Decision**: The control window is a single Tauri window (`main`). No multi-instance support is planned. The Tauri `single_instance` plugin can be enabled to prevent duplicate app launches.
- **Rationale**: Matches FR-012. Tauri's `tauri-plugin-single-instance` enforces one process.


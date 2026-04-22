# Implementation Plan: Krachtbal Scoreboard

**Branch**: `001-krachtbal-scoreboard`  
**Spec**: `specs/001-krachtbal-scoreboard/spec.md`  
**Status**: Ready for implementation

---

## Technical Context

| Item | Decision |
|------|----------|
| Framework | Tauri 2 + React 18 + TypeScript |
| State management | Zustand |
| Multi-window sync | Tauri IPC event bus (`emit` / `listen`) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint (`@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`) + Prettier |
| Audio (buzzers) | Web Audio API (oscillator) |
| Single-binary target | Linux + Windows via `pnpm tauri build` |
| Single-instance enforcement | `tauri-plugin-single-instance` |
| Build/CI | GitHub Actions + `tauri-apps/tauri-action` |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend Application Discipline | ✅ PASS | Components, store, hooks, utils are separated |
| II. Linting Enforcement | ✅ PASS | ESLint + Prettier; CI blocks merge on lint failure |
| III. Mandatory Testing | ✅ PASS | Vitest + RTL; coverage enforced in CI |
| IV. Cross-Platform Single Binary | ✅ PASS | Tauri 2 produces native binaries for Linux and Windows |
| V. Build and Execution Simplicity | ✅ PASS | quickstart.md documents all steps; ≤3 commands to run |

---

## Artifacts

| Artifact | Path |
|----------|------|
| Feature spec | `specs/001-krachtbal-scoreboard/spec.md` |
| Research | `specs/001-krachtbal-scoreboard/research.md` |
| Data model | `specs/001-krachtbal-scoreboard/data-model.md` |
| UI contracts | `specs/001-krachtbal-scoreboard/contracts/ui-contracts.md` |
| Quickstart | `specs/001-krachtbal-scoreboard/quickstart.md` |
| This plan | `specs/001-krachtbal-scoreboard/plan.md` |

---

## Phase 1 – Project Scaffold

### 1.1 Initialize Tauri + React + TypeScript project

```bash
pnpm create tauri-app krachtbal-scoreboard \
  --template react-ts \
  --manager pnpm
```

- Configure `tauri.conf.json`:
  - `productName`: `Krachtbal Scoreboard`
  - `identifier`: `be.krachtbal.scoreboard`
  - `windows[0]`: label `main`, title `Control`, width 1280, height 800
  - Enable `tauri-plugin-single-instance`
- Add `src-tauri/Cargo.toml` dependencies: `tauri-plugin-single-instance`
- Set up Vite router (React Router v6) with two routes:
  - `/` → `ControlApp` (control window)
  - `/presentation` → `PresentationApp` (presentation window)

### 1.2 Configure linting and formatting

- Install: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `prettier`, `eslint-config-prettier`
- Create `.eslintrc.cjs` and `.prettierrc`
- Add scripts to `package.json`: `lint`, `lint:fix`, `format`

### 1.3 Configure testing

- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
- Create `vitest.config.ts` with `jsdom` environment
- Add scripts: `test`, `test:run`, `test:coverage`

### 1.4 Configure CI

- Create `.github/workflows/ci.yml`:
  - Jobs: lint, test, build-linux, build-windows
  - `build-linux` runs on `ubuntu-latest`, `build-windows` on `windows-latest`
  - Uses `tauri-apps/tauri-action@v0`
  - Artifacts: upload binaries per OS

**Tests for 1.x**: Scaffold test — CI passes on empty project.

---

## Phase 2 – Data Model & Store

### 2.1 Define TypeScript types

File: `src/types/game.ts`

```ts
export type GamePhase = 'SETUP' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'ENDED';

export interface Player {
  number: number;
  name: string;
  penalties: number;
}

export interface TeamConfig {
  name: string;
  color: string;
  players: Player[];
}

export interface GameConfig {
  teamA: TeamConfig;
  teamB: TeamConfig;
  referee: string;
  halfTimeLengthMinutes: number;
  numPresentationWindows: number;
}

export interface RestMinuteState {
  initiatorTeam: 'A' | 'B';
  remainingMs: number;
  buzzerFired: boolean;
}

export interface GameState {
  phase: GamePhase;
  config: GameConfig | null;
  scoreA: number;
  scoreB: number;
  playedTimeMs: number;
  clockRunning: boolean;
  restMinute: RestMinuteState | null;
  restMinutesUsedA: number;
  restMinutesUsedB: number;
  // Mutable player penalty arrays (deep clone from config on startGame)
  teamAPlayers: Player[];
  teamBPlayers: Player[];
}
```

### 2.2 Implement Zustand store

File: `src/store/gameStore.ts`

Actions to implement (see contracts/ui-contracts.md for guards):

- `setConfig(config: GameConfig)`
- `startGame()` — validates config, opens presentation windows via Tauri API
- `toggleClock()`
- `adjustScore(team, delta)`
- `addPenalty(team, playerNum)`
- `resetPenalty(team, playerNum)`
- `initiateRestMinute(team)` — fires buzzer, starts countdown
- `tickRestMinute(deltaMs)` — called by timer hook; clears rest minute when `remainingMs <= 0`
- `tickClock(deltaMs)` — called by timer hook; auto-transitions to HALF_TIME or ENDED
- `startSecondHalf()`
- `resetGame()` — clears state, closes presentation windows

After every state mutation, emit `game-state-update` to all windows:
```ts
import { emit } from '@tauri-apps/api/event';
emit('game-state-update', buildPayload(state));
```

**Tests for 2.x**:
- Unit tests for each store action (valid and invalid transitions)
- Guard tests: score cannot go < 0, rest minute blocked when no active game, etc.
- State transition tests: SETUP → FIRST_HALF → HALF_TIME → SECOND_HALF → ENDED → SETUP

---

## Phase 3 – Timer & Audio Hooks

### 3.1 `useGameTimer` hook

File: `src/hooks/useGameTimer.ts`

- Uses `requestAnimationFrame` (or `setInterval` at 100 ms) to tick `tickClock(deltaMs)` and `tickRestMinute(deltaMs)` when clock is running / rest minute active.
- Handles tab visibility change (pause on hide, resume on show).

### 3.2 `useBuzzer` hook

File: `src/hooks/useBuzzer.ts`

- Wraps Web Audio API to play a buzzer sound (oscillator, 880 Hz, 0.5 s).
- `playBuzzer()` function exposed to store actions.

**Tests for 3.x**:
- `useGameTimer`: mock timers, verify `tickClock` called at correct intervals.
- `useBuzzer`: verify `AudioContext` is created and `oscillator.start()` called.

---

## Phase 4 – Configuration Window

### 4.1 Components

Files under `src/components/config/`:

| Component | Responsibility |
|-----------|----------------|
| `ConfigWindow.tsx` | Root layout, form state, submit handler |
| `TeamConfigForm.tsx` | Team name, color picker, player list |
| `PlayerRow.tsx` | Individual player name + number input |
| `RefereeField.tsx` | Referee name input |
| `HalfTimeLengthField.tsx` | Half-time length input (minutes) |
| `PresentationWindowCountField.tsx` | Number of presentation windows |
| `StartGameButton.tsx` | Disabled until all validations pass |

### 4.2 Validation

- Use React Hook Form + Zod schema matching the config form contract in `contracts/ui-contracts.md`.
- Show inline error messages on invalid fields.
- `StartGameButton` disabled while any error exists or any required field is empty.

**Tests for 4.x**:
- Renders all fields
- Prevents submit when required fields missing (FR-002)
- Calls `startGame()` when valid config submitted
- Player number uniqueness validated per team

---

## Phase 5 – In-game Control Window

### 5.1 Components

Files under `src/components/control/`:

| Component | Responsibility |
|-----------|----------------|
| `ControlWindow.tsx` | Root layout, mounts after game starts |
| `ClockDisplay.tsx` | Shows played time MM:SS, play/pause button |
| `ScorePanel.tsx` | Score display + increment/decrement buttons per team |
| `PenaltyPanel.tsx` | Player list with +/- penalty buttons per team |
| `RestMinutePanel.tsx` | Initiate rest minute, countdown display, rest minute counters |
| `InitiatorPopup.tsx` | Modal to select initiating team for rest minute |
| `HalfTimePanel.tsx` | Start second half button (shown during HALF_TIME) |
| `EndGamePanel.tsx` | Reset game button (shown during ENDED) |

### 5.2 Layout

- Split-panel: left = Team A controls, right = Team B controls, center = clock + score.
- Status bar showing current phase.

**Tests for 5.x**:
- ClockDisplay: renders time, play/pause toggles clock
- ScorePanel: increment/decrement dispatches `adjustScore`; decrement disabled at 0
- PenaltyPanel: add/reset dispatches correct actions
- RestMinutePanel: initiate button opens popup; countdown visible during rest minute
- InitiatorPopup: selecting team calls `initiateRestMinute(team)` and closes popup
- HalfTimePanel: only visible in HALF_TIME phase; button calls `startSecondHalf()`
- EndGamePanel: only visible in ENDED phase; button calls `resetGame()`

---

## Phase 6 – Presentation Window

### 6.1 Components

Files under `src/components/presentation/`:

| Component | Responsibility |
|-----------|----------------|
| `PresentationWindow.tsx` | Root; subscribes to IPC events on mount, requests sync |
| `ScoreBoard.tsx` | Team names (colored), score, referee |
| `TimerDisplay.tsx` | Played time MM:SS + phase label |
| `RestMinuteDisplay.tsx` | Rest minute countdown + initiator team name |
| `PenaltyDisplay.tsx` | Player penalty rows (name, number, Xs) per team |
| `RestMinuteCounters.tsx` | Rest minutes used per team |

### 6.2 State sync

- On mount: call `emit('request-state-sync', { windowLabel })`.
- Listen to `game-state-update` and `state-sync-response` to update local display state.
- On error/reconnect: re-emit `request-state-sync` (FR-008, FR-009).

### 6.3 Tauri backend (`src-tauri/src/main.rs`)

- Listen for `request-state-sync` from presentation windows.
- Re-emit current state snapshot to the requesting window.
- Alternatively: relay handled in the control window JS (simpler).

**Tests for 6.x**:
- PresentationWindow: mounts and emits `request-state-sync`
- Receiving `game-state-update` updates rendered output
- ScoreBoard: renders team names with correct colors
- PenaltyDisplay: renders correct number of Xs per player
- RestMinuteDisplay: hidden when `restMinute === null`

---

## Phase 7 – Multi-Window Management

### 7.1 Opening presentation windows

In `startGame()` store action:

```ts
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

for (let i = 0; i < config.numPresentationWindows; i++) {
  new WebviewWindow(`presentation-${i}`, {
    url: '/presentation',
    title: `Scoreboard ${i + 1}`,
    fullscreen: true,
  });
}
```

### 7.2 Closing presentation windows

In `resetGame()` store action:

```ts
for (let i = 0; i < config.numPresentationWindows; i++) {
  const win = await WebviewWindow.getByLabel(`presentation-${i}`);
  await win?.close();
}
```

### 7.3 Reconnect handling

If a presentation window is closed and reopened manually, it emits `request-state-sync` on mount. The control window listens and responds with the current snapshot.

**Tests for 7.x**:
- `startGame()` creates correct number of WebviewWindow instances (mock Tauri API)
- `resetGame()` closes all presentation windows
- Reconnect: emitting `request-state-sync` triggers `state-sync-response` with current state

---

## Phase 8 – Integration & Edge Cases

### 8.1 Half-time buzzer
- `tickClock` in store checks `playedTimeMs >= halfTimeLengthMs` during `FIRST_HALF` or `SECOND_HALF`.
- Calls `playBuzzer()` and transitions phase.
- Test: clock ticking past half-time length triggers buzzer and phase transition.

### 8.2 Rest minute buzzer
- `initiateRestMinute(team)` calls `playBuzzer()` immediately.
- Test: buzzer fires on rest minute initiation.

### 8.3 Rest minute counter
- `clearRestMinute()` increments `restMinutesUsedA` or `restMinutesUsedB`.
- Test: counter increments correctly.

### 8.4 Blocked mid-game presentation window count change
- `numPresentationWindows` field in config form is disabled after game start (FR-011).
- Test: field is read-only when phase !== SETUP.

### 8.5 Single instance
- `tauri-plugin-single-instance` configured in `tauri.conf.json`.
- No unit test needed; covered by Tauri plugin.

---

## Phase 9 – Final QA & Documentation

### 9.1 End-to-end smoke test (manual)
- Complete pre-game setup → start game → verify N presentation windows open.
- Play/pause, score, penalty, rest minute → verify all windows update within 1 s (SC-002).
- Run through half-time, second half, end game, reset.
- Close and reopen a presentation window during game → verify resync (FR-008).

### 9.2 Coverage gate
- `vitest --coverage` must show ≥ 80% line coverage on `src/store/`, `src/hooks/`, `src/utils/`.

### 9.3 Documentation
- `quickstart.md` must match final build steps.
- `README.md` at project root: short description, link to quickstart.

---

## Dependency Summary

### Runtime (npm)
| Package | Purpose |
|---------|---------|
| `react` `react-dom` | UI framework |
| `react-router-dom` | `/` vs `/presentation` routing |
| `zustand` | State management |
| `react-hook-form` | Config form state |
| `zod` | Config validation schema |
| `@tauri-apps/api` | Tauri JS bindings |
| `@tauri-apps/plugin-single-instance` | Single-instance enforcement |

### Dev (npm)
| Package | Purpose |
|---------|---------|
| `vite` | Frontend bundler |
| `typescript` | Type checking |
| `eslint` + plugins | Linting |
| `prettier` | Formatting |
| `vitest` | Test runner |
| `@testing-library/react` | Component testing |
| `@testing-library/user-event` | User interaction simulation |
| `@testing-library/jest-dom` | DOM matchers |
| `jsdom` | DOM environment for Vitest |
| `@vitest/coverage-v8` | Coverage |

### Rust (Cargo)
| Crate | Purpose |
|-------|---------|
| `tauri` `2` | App shell |
| `tauri-plugin-single-instance` | Single instance |

---

## Success Criteria Traceability

| SC | Covered by |
|----|------------|
| SC-001: Setup < 2 min | Phase 4 – simple form, validation |
| SC-002: Sync < 1 s | Phase 2 store emit on every mutation + Phase 6 listener |
| SC-003: 100% actions reflected | Phase 5 + Phase 6 + tests |
| SC-004: Reset < 30 s | Phase 5 EndGamePanel + Phase 7 window close |
| SC-005: Reconnect < 5 s | Phase 6 reconnect handling + Phase 8.3 |
| SC-006: 95% no sync issues | Phase 2 store correctness + Phase 8 edge cases |


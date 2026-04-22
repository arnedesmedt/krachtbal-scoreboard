# Tasks: Krachtbal Scoreboard

**Feature**: Krachtbal Scoreboard  
**Spec**: `specs/001-krachtbal-scoreboard/spec.md`  
**Plan**: `specs/001-krachtbal-scoreboard/plan.md`  
**Branch**: `001-krachtbal-scoreboard`  
**Stack**: Tauri 2 + React 18 + TypeScript · Zustand · Vitest + RTL · ESLint + Prettier · GitHub Actions

---

## Implementation Strategy

**MVP scope**: Complete Phase 1 + Phase 2 + Phase 3 (US1 – Pre-game Setup) to have a runnable app with working config and presentation window launch.

**Delivery order**:
1. Phase 1 – Scaffold & Tooling (blocks everything)
2. Phase 2 – Data Types, Store, Hooks (blocks all UI phases)
3. Phase 3 – US1: Pre-game Setup (blocks US2/US4)
4. Phase 4 – US4: Presentation Windows (unblocks real sync testing)
5. Phase 5 – US2: In-game Control (depends on store from Phase 2)
6. Phase 6 – US3: Post-game Reset (depends on US2)
7. Phase 7 – Polish, CI, Documentation

---

## Phase 1 – Scaffold & Tooling

**Goal**: Runnable Tauri + React + TypeScript project with linting, testing, and CI configured.  
**Independent Test**: `pnpm lint && pnpm test:run` both pass on a freshly cloned repo; `pnpm tauri dev` opens the app.

- [X] T001 Scaffold Tauri 2 + React 18 + TypeScript project using `pnpm create tauri-app krachtbal-scoreboard --template react-ts --manager pnpm` and commit the generated base to the repo root
- [X] T002 Configure `src-tauri/tauri.conf.json`: set `productName` to `Krachtbal Scoreboard`, `identifier` to `be.krachtbal.scoreboard`, initial window label `main`, title `Control`, width 1280, height 800
- [X] T003 Add `tauri-plugin-single-instance` to `src-tauri/Cargo.toml` and register it in `src-tauri/src/main.rs`
- [X] T004 Install npm runtime dependencies: `react-router-dom`, `zustand`, `react-hook-form`, `zod`, `@tauri-apps/api`, `@tauri-apps/plugin-single-instance` in `package.json`
- [X] T005 Install npm dev dependencies: `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-config-prettier`, `prettier`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `@vitest/coverage-v8` in `package.json`
- [X] T006 Create `.eslintrc.cjs` with `@typescript-eslint`, `react`, `react-hooks`, and `prettier` config rules; create `.prettierrc` with project formatting defaults
- [X] T007 Create `vitest.config.ts` with `jsdom` environment, `globals: true`, and `setupFiles` pointing to a `src/test/setup.ts` that imports `@testing-library/jest-dom`
- [X] T008 Add scripts to `package.json`: `lint`, `lint:fix`, `format`, `test`, `test:run`, `test:coverage`
- [X] T009 Set up React Router v6 in `src/App.tsx` with two routes: `/` → `ControlApp` placeholder and `/presentation` → `PresentationApp` placeholder; update `src/main.tsx` accordingly
- [X] T010 Create `.github/workflows/ci.yml` with four jobs: `lint` (runs `pnpm lint`), `test` (runs `pnpm test:run --coverage`), `build-linux` (on `ubuntu-latest`, uses `tauri-apps/tauri-action@v0`, uploads AppImage artifact), `build-windows` (on `windows-latest`, same action, uploads .exe artifact)

---

## Phase 2 – Data Model, Store & Hooks (Foundation)

**Goal**: All TypeScript types, the Zustand game store with guards, the timer hook, and the buzzer hook are implemented and unit-tested.  
**Independent Test**: `pnpm test:run` passes all store action tests including state transition chain `SETUP → FIRST_HALF → HALF_TIME → SECOND_HALF → ENDED → SETUP`.

### Types

- [X] T011 [P] Create `src/types/game.ts` defining `GamePhase`, `Player`, `TeamConfig`, `GameConfig`, `RestMinuteState`, and `GameState` types exactly as specified in `specs/001-krachtbal-scoreboard/data-model.md`
- [X] T012 [P] Create `src/utils/formatTime.ts` exporting `formatMs(ms: number): string` that formats milliseconds to `MM:SS`

### Store

- [X] T013 Implement `src/store/gameStore.ts` Zustand store with initial state (`phase: 'SETUP'`, zero scores, null restMinute) and all action stubs: `setConfig`, `startGame`, `toggleClock`, `adjustScore`, `addPenalty`, `resetPenalty`, `initiateRestMinute`, `tickRestMinute`, `tickClock`, `clearRestMinute`, `startSecondHalf`, `resetGame`
- [X] T014 Implement `setConfig(config: GameConfig)` in `src/store/gameStore.ts` — only mutates state when `phase === 'SETUP'`
- [X] T015 Implement `startGame()` in `src/store/gameStore.ts` — validates config completeness, transitions to `FIRST_HALF`, deep-clones player arrays into `teamAPlayers`/`teamBPlayers`, opens N presentation windows via `WebviewWindow` (`presentation-0` … `presentation-{N-1}`) loading `/presentation`, emits `game-state-update`
- [X] T016 Implement `toggleClock()` in `src/store/gameStore.ts` — guards `phase in [FIRST_HALF, SECOND_HALF]`, toggles `clockRunning`, emits `game-state-update`
- [X] T017 Implement `adjustScore(team, delta)` in `src/store/gameStore.ts` — guards active half + score ≥ 0, emits `game-state-update`
- [X] T018 Implement `addPenalty(team, playerNum)` and `resetPenalty(team, playerNum)` in `src/store/gameStore.ts` — guard active half; `resetPenalty` guards penalties > 0; both emit `game-state-update`
- [X] T019 Implement `initiateRestMinute(team)` in `src/store/gameStore.ts` — guards no active rest minute + clock running, sets `restMinute` with 60 000 ms, calls `playBuzzer()`, emits `game-state-update`
- [X] T020 Implement `tickRestMinute(deltaMs)` in `src/store/gameStore.ts` — decrements `restMinute.remainingMs`; when ≤ 0 calls `clearRestMinute()` which increments `restMinutesUsedA` or `B` and nullifies `restMinute`; emits `game-state-update`
- [X] T021 Implement `tickClock(deltaMs)` in `src/store/gameStore.ts` — increments `playedTimeMs` when `clockRunning`; transitions `FIRST_HALF → HALF_TIME` or `SECOND_HALF → ENDED` when `playedTimeMs >= halfTimeLengthMs`, stops clock, calls `playBuzzer()`; emits `game-state-update`
- [X] T022 Implement `startSecondHalf()` in `src/store/gameStore.ts` — guards `phase === HALF_TIME`, resets `playedTimeMs` to 0, transitions to `SECOND_HALF`, emits `game-state-update`
- [X] T023 Implement `resetGame()` in `src/store/gameStore.ts` — guards `phase === ENDED`, closes all presentation windows via `WebviewWindow.getByLabel`, resets state to initial, emits `game-state-update`
- [X] T024 Add `listen('request-state-sync', handler)` in `src/store/gameStore.ts` (or a dedicated `src/store/syncListener.ts`) — handler emits `state-sync-response` with current state snapshot back to the requesting window label

### Store Tests

- [X] T025 [P] Create `src/store/gameStore.test.ts` — test `setConfig` sets config only in SETUP, is blocked otherwise
- [X] T026 [P] Create store test for `startGame()` — valid config transitions to FIRST_HALF; missing fields throw/block
- [X] T027 [P] Create store test for full phase transition chain: SETUP → FIRST_HALF → HALF_TIME → SECOND_HALF → ENDED → SETUP
- [X] T028 [P] Create store test for `adjustScore` — increments/decrements correctly, cannot go below 0, blocked outside active half
- [X] T029 [P] Create store test for `addPenalty` / `resetPenalty` — correct player updated, blocked outside active half, resetPenalty blocked at 0
- [X] T030 [P] Create store test for `initiateRestMinute` — blocked when restMinute active or clock stopped; sets restMinute correctly
- [X] T031 [P] Create store test for `tickRestMinute` — decrements, clears at 0, increments correct rest minute counter
- [X] T032 [P] Create store test for `tickClock` — triggers HALF_TIME transition at correct threshold; triggers ENDED transition

### Hooks

- [X] T033 [P] Implement `src/hooks/useGameTimer.ts` — uses `requestAnimationFrame` to call `tickClock(deltaMs)` and `tickRestMinute(deltaMs)` when applicable; pauses on `document.visibilitychange` hidden
- [X] T034 [P] Implement `src/hooks/useBuzzer.ts` — exposes `playBuzzer()` that creates a Web Audio API oscillator at 880 Hz for 500 ms; used by store actions via a module-level singleton ref
- [X] T035 [P] Create `src/hooks/useGameTimer.test.ts` — mock `requestAnimationFrame` with fake timers, assert `tickClock` called with correct deltaMs
- [X] T036 [P] Create `src/hooks/useBuzzer.test.ts` — mock `AudioContext`; assert `oscillator.start()` and `oscillator.stop()` called

---

## Phase 3 – User Story 1: Pre-game Setup

**Story**: As a game official, I want to configure all game parameters before the game starts so that presentation windows open with accurate initial state.  
**Independent Test**: Fill in all config fields → click Start Game → N presentation windows open showing correct team names, colors, referee; incomplete form shows validation errors and Start Game is disabled.

### Config Form Validation Schema

- [X] T037 [P] [US1] Create `src/utils/configSchema.ts` — Zod schema for `GameConfig` matching the validation rules in `specs/001-krachtbal-scoreboard/contracts/ui-contracts.md` (team name 1–50 chars, hex color, players ≥ 1 each with unique number ≥ 1, referee 1–50, halfTime 1–60, windows 1–10)

### Config Components

- [X] T038 [US1] Create `src/components/config/PlayerRow.tsx` — inputs for player name (required) and player number (unique integer ≥ 1); inline validation error display
- [X] T039 [US1] Create `src/components/config/TeamConfigForm.tsx` — team name input, color picker (`<input type="color">`), dynamic list of `PlayerRow` components with add/remove, validates at least 1 player and unique numbers within team
- [X] T040 [US1] Create `src/components/config/RefereeField.tsx` — text input for referee name with validation
- [X] T041 [US1] Create `src/components/config/HalfTimeLengthField.tsx` — number input for half-time length (minutes, 1–60)
- [X] T042 [US1] Create `src/components/config/PresentationWindowCountField.tsx` — number input for presentation window count (1–10); renders as disabled/read-only when `phase !== 'SETUP'`
- [X] T043 [US1] Create `src/components/config/StartGameButton.tsx` — disabled while any React Hook Form error exists or required field is empty; calls `startGame()` from store on click
- [X] T044 [US1] Create `src/components/config/ConfigWindow.tsx` — root layout wrapping all config sub-components using React Hook Form + Zod resolver; shows inline field-level errors; routes to `ControlWindow` after successful `startGame()`

### Config Tests

- [X] T045 [P] [US1] Create `src/components/config/ConfigWindow.test.tsx` — renders all fields; Start Game disabled on empty form; shows error when required fields missing; calls `startGame()` with valid data; player number uniqueness error shown on duplicate
- [X] T046 [P] [US1] Create `src/components/config/PresentationWindowCountField.test.tsx` — field is disabled when `phase !== 'SETUP'`

---

## Phase 4 – User Story 4: Presentation Windows

**Story**: As a spectator or official, I want each presentation window to show synchronized game state identically and in real time.  
**Independent Test**: Open 2 presentation windows → mutate store → both windows re-render with correct updated values within 1 render cycle.

### Presentation Components

- [X] T047 [P] [US4] Create `src/utils/formatTime.test.ts` — unit tests for `formatMs`: 0 → `00:00`, 65000 → `01:05`, 3599999 → `59:59`
- [X] T048 [US4] Create `src/components/presentation/ScoreBoard.tsx` — renders Team A and Team B colored name banners, large score display `{scoreA} – {scoreB}`, and referee plain-text label; receives `GameStateUpdatePayload` as props
- [X] T049 [US4] Create `src/components/presentation/TimerDisplay.tsx` — renders `playedTimeMs` as `MM:SS` using `formatMs` and a human-readable phase label (map `GamePhase` to "First Half", "Half Time", etc.)
- [X] T050 [US4] Create `src/components/presentation/RestMinuteDisplay.tsx` — hidden when `restMinute === null`; shows countdown `MM:SS` and initiator team name when active
- [X] T051 [US4] Create `src/components/presentation/PenaltyDisplay.tsx` — one row per player per team showing player name, number, and one "X" per penalty count
- [X] T052 [US4] Create `src/components/presentation/RestMinuteCounters.tsx` — displays `restMinutesUsedA` and `restMinutesUsedB` integer counters with team labels (note: add `restMinutesUsedA`/`restMinutesUsedB` to `GameStateUpdatePayload` in `src/types/game.ts` and `src/store/gameStore.ts`)
- [X] T053 [US4] Create `src/components/presentation/PresentationWindow.tsx` — on mount calls `emit('request-state-sync', { windowLabel })` and registers `listen('game-state-update', handler)` and `listen('state-sync-response', handler)` to update local display state; on unmount removes listeners; renders `ScoreBoard`, `TimerDisplay`, `RestMinuteDisplay`, `PenaltyDisplay`, `RestMinuteCounters`; on event error re-emits `request-state-sync`

### Presentation Tests

- [X] T054 [P] [US4] Create `src/components/presentation/PresentationWindow.test.tsx` — mocks Tauri `emit`/`listen`; asserts `request-state-sync` emitted on mount; asserts re-render after `game-state-update` event fired
- [X] T055 [P] [US4] Create `src/components/presentation/ScoreBoard.test.tsx` — renders correct team names with inline color styles; shows correct score string
- [X] T056 [P] [US4] Create `src/components/presentation/PenaltyDisplay.test.tsx` — player with 3 penalties renders exactly 3 "X" characters
- [X] T057 [P] [US4] Create `src/components/presentation/RestMinuteDisplay.test.tsx` — hidden when `restMinute === null`; visible with correct countdown and team name when active

---

## Phase 5 – User Story 2: In-game Control

**Story**: As a game official, I want to control game state (play/pause, scores, penalties, rest minutes, buzzers, second half) with all changes instantly reflected in all presentation windows.  
**Independent Test**: With game in FIRST_HALF: toggle clock → score changes → add penalty → initiate rest minute (select initiator) → verify each action reflected in store state and presentation windows re-render.

### Control Components

- [X] T058 [US2] Create `src/components/control/ClockDisplay.tsx` — shows `playedTimeMs` as `MM:SS`; play/pause button calls `toggleClock()`; disabled outside active half phases
- [X] T059 [US2] Create `src/components/control/ScorePanel.tsx` — per-team score display with `+1`/`-1` buttons calling `adjustScore(team, delta)`; decrement button disabled when score is 0
- [X] T060 [US2] Create `src/components/control/PenaltyPanel.tsx` — list all players for a team, each row with `+` (addPenalty) and `−` (resetPenalty, disabled at 0) buttons; shows current penalty count
- [X] T061 [US2] Create `src/components/control/InitiatorPopup.tsx` — modal dialog with two buttons (Team A / Team B); on selection calls `initiateRestMinute(team)` and closes popup
- [X] T062 [US2] Create `src/components/control/RestMinutePanel.tsx` — "Initiate Rest Minute" button (opens `InitiatorPopup`; disabled when clock stopped or rest minute active); countdown `MM:SS` visible when rest minute active; shows `restMinutesUsedA` and `restMinutesUsedB` counters
- [X] T063 [US2] Create `src/components/control/HalfTimePanel.tsx` — visible only when `phase === 'HALF_TIME'`; "Start Second Half" button calls `startSecondHalf()`
- [X] T064 [US2] Create `src/components/control/EndGamePanel.tsx` — visible only when `phase === 'ENDED'`; "Reset Game" button calls `resetGame()`
- [X] T065 [US2] Create `src/components/control/ControlWindow.tsx` — root layout: left panel (Team A `ScorePanel` + `PenaltyPanel`), center (`ClockDisplay` + `RestMinutePanel` + status bar showing current phase), right panel (Team B `ScorePanel` + `PenaltyPanel`); renders `HalfTimePanel` and `EndGamePanel` contextually; mounts `useGameTimer`

### Control Tests

- [X] T066 [P] [US2] Create `src/components/control/ClockDisplay.test.tsx` — renders formatted time; play button calls `toggleClock`; button label toggles between Play/Pause
- [X] T067 [P] [US2] Create `src/components/control/ScorePanel.test.tsx` — increment dispatches `adjustScore(team, +1)`; decrement dispatches `adjustScore(team, -1)`; decrement disabled at score 0
- [X] T068 [P] [US2] Create `src/components/control/PenaltyPanel.test.tsx` — add button dispatches `addPenalty`; reset button dispatches `resetPenalty`; reset disabled at 0 penalties
- [X] T069 [P] [US2] Create `src/components/control/RestMinutePanel.test.tsx` — initiate button opens `InitiatorPopup`; countdown shown when rest minute active; disabled when clock stopped
- [X] T070 [P] [US2] Create `src/components/control/InitiatorPopup.test.tsx` — selecting Team A calls `initiateRestMinute('A')` and closes popup
- [X] T071 [P] [US2] Create `src/components/control/HalfTimePanel.test.tsx` — only rendered during HALF_TIME; button calls `startSecondHalf()`
- [X] T072 [P] [US2] Create `src/components/control/EndGamePanel.test.tsx` — only rendered during ENDED; button calls `resetGame()`

---

## Phase 6 – User Story 3: Post-game Reset

**Story**: As a game official, I want to reset all game data and close all presentation windows after the game so the system is ready for the next match.  
**Independent Test**: With game in ENDED phase → click Reset Game → store returns to `SETUP` initial state → all `presentation-*` Tauri windows are closed.

- [X] T073 [US3] Verify `resetGame()` action in `src/store/gameStore.ts` correctly closes all `WebviewWindow` instances named `presentation-0` through `presentation-{N-1}` (from current config snapshot) and resets full state to initial values (scores 0, phase SETUP, null config, null restMinute, zero counters)
- [X] T074 [P] [US3] Create `src/store/gameStore.resetGame.test.ts` (or add to existing store test file) — mock `WebviewWindow.getByLabel` and `.close()`; assert all N windows closed; assert state fully reset to initial after `resetGame()`

---

## Phase 7 – Polish & Cross-cutting Concerns

**Goal**: Coverage gate, CI green, edge cases verified, documentation accurate.

- [X] T075 [P] Add `src/utils/gamePhaseLabel.ts` exporting `phaseLabel(phase: GamePhase): string` map (`FIRST_HALF` → "First Half", `HALF_TIME` → "Half Time", `SECOND_HALF` → "Second Half", `ENDED` → "Ended", `SETUP` → "Setup")
- [X] T076 [P] Create `src/__mocks__/@tauri-apps/api/event.ts` and `src/__mocks__/@tauri-apps/api/webviewWindow.ts` Vitest manual mocks so all tests can import Tauri APIs without native bindings
- [X] T077 Implement state-sync relay in `src/store/syncListener.ts` (or inline in store): `listen('request-state-sync')` handler calls `emit('state-sync-response', currentSnapshot)` targeted at the requesting window label to satisfy FR-008 reconnect flow
- [X] T078 Ensure `PresentationWindowCountField` in `src/components/config/PresentationWindowCountField.tsx` is rendered as `disabled` when `phase !== 'SETUP'` (FR-011 — blocks mid-game window count change)
- [X] T079 Verify `src-tauri/tauri.conf.json` has `tauri-plugin-single-instance` in plugins and `allowlist`/permissions configured for `window.create`, `window.close`, and `event.emit`/`event.listen` (FR-012 single controller)
- [X] T080 Run `pnpm test:coverage` and confirm ≥ 80% line coverage on `src/store/`, `src/hooks/`, `src/utils/`; fix any gaps
- [X] T081 Update `specs/001-krachtbal-scoreboard/quickstart.md` to reflect final build commands, any changed prerequisites, and actual output binary paths
- [X] T082 Create `README.md` at project root with short description, tech stack, link to `specs/001-krachtbal-scoreboard/quickstart.md`, and `pnpm tauri dev` quickstart command

---

## Dependency Graph

```
Phase 1 (T001–T010)
    └── Phase 2: Types + Store + Hooks (T011–T036)
            ├── Phase 3: US1 Config UI (T037–T046)  ← MVP stop point
            │       └── Phase 4: US4 Presentation (T047–T057)
            │               └── Phase 5: US2 Control UI (T058–T072)
            │                       └── Phase 6: US3 Reset (T073–T074)
            │                               └── Phase 7: Polish (T075–T082)
            └── (store tests T025–T032 parallel within Phase 2)
```

**User story dependencies**:
- US1 (Pre-game Setup) → must complete before US2 and US4 (game cannot start without config)
- US4 (Presentation) → can be built in parallel with US2 once store is ready; needs US1 for integration
- US2 (In-game Control) → depends on store (Phase 2) being complete
- US3 (Post-game Reset) → depends on US2 (game must reach ENDED phase)

---

## Parallel Execution Examples

| Phase | Tasks that can run in parallel |
|-------|-------------------------------|
| Phase 2 | T011 (types) ‖ T012 (formatTime util) — then T013 unblocks; T025–T032 (store tests) all parallel after T013–T023 |
| Phase 2 | T033 (useGameTimer) ‖ T034 (useBuzzer) — independent files |
| Phase 3 | T037 (Zod schema) ‖ T038–T042 (leaf config components) — all independent files |
| Phase 4 | T048–T052 (all presentation sub-components) — independent files, parallel |
| Phase 4 | T054–T057 (presentation tests) — parallel after respective components |
| Phase 5 | T058–T064 (all control sub-components) — independent files, parallel |
| Phase 5 | T066–T072 (control tests) — parallel after respective components |
| Phase 7 | T075 ‖ T076 ‖ T078 ‖ T079 ‖ T081 ‖ T082 — all independent |

---

## Task Summary

| Phase | Scope | Task count |
|-------|-------|-----------|
| Phase 1 | Scaffold & Tooling | 10 (T001–T010) |
| Phase 2 | Data Model, Store, Hooks + tests | 26 (T011–T036) |
| Phase 3 | US1 – Pre-game Setup | 10 (T037–T046) |
| Phase 4 | US4 – Presentation Windows | 11 (T047–T057) |
| Phase 5 | US2 – In-game Control | 15 (T058–T072) |
| Phase 6 | US3 – Post-game Reset | 2 (T073–T074) |
| Phase 7 | Polish & Cross-cutting | 8 (T075–T082) |
| **Total** | | **82 tasks** |

**Parallel opportunities identified**: 38 tasks marked `[P]`  
**MVP scope**: T001–T046 (Phases 1–3) — runnable app with full pre-game config and presentation window launch  
**Format validation**: All 82 tasks follow the `- [X] TXXX [P?] [USX?] Description with file path` checklist format ✅


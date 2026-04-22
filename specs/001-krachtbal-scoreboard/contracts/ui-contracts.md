# UI Contracts: Krachtbal Scoreboard

## Overview
This document defines the interface contracts between the Control Window, the Presentation Window, and the Tauri IPC event bus.

---

## 1. Tauri IPC Event Bus (Control → Presentation)

All presentation windows subscribe to the `game-state-update` event. The payload is a complete `GameState` snapshot (no partial diffs).

### Event: `game-state-update`
**Direction**: Control Window → all Presentation Windows (broadcast)  
**Trigger**: Any state mutation in the control window store  
**Payload** (TypeScript type):

```ts
type GameStateUpdatePayload = {
  phase: 'SETUP' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'ENDED';
  scoreA: number;
  scoreB: number;
  playedTimeMs: number;
  halfTimeLengthMs: number;
  clockRunning: boolean;
  restMinute: {
    initiatorTeam: 'A' | 'B';
    remainingMs: number;
    buzzerFired: boolean;
  } | null;
  teamA: {
    name: string;
    color: string; // CSS hex, e.g. '#FF0000'
    players: Array<{ number: number; name: string; penalties: number }>;
  };
  teamB: {
    name: string;
    color: string;
    players: Array<{ number: number; name: string; penalties: number }>;
  };
  referee: string;
};
```

### Event: `request-state-sync`
**Direction**: Presentation Window → Control Window  
**Trigger**: Presentation window mounts or reconnects (FR-008)  
**Payload**: `{ windowLabel: string }`

### Event: `state-sync-response`
**Direction**: Control Window → specific Presentation Window  
**Trigger**: Received `request-state-sync`  
**Payload**: Full `GameStateUpdatePayload` (same schema as `game-state-update`)

---

## 2. Control Window – User Action Schema

These are the store actions dispatched by the control UI. They are internal to the control window (not IPC); listed here as the authoritative interface for the store layer.

| Action                        | Parameters                                  | Guard                                      |
|-------------------------------|---------------------------------------------|--------------------------------------------|
| `setConfig(config)`           | `GameConfig`                                | Only in SETUP phase                        |
| `startGame()`                 | —                                           | Config valid, phase === SETUP              |
| `toggleClock()`               | —                                           | phase in [FIRST_HALF, SECOND_HALF]         |
| `adjustScore(team, delta)`    | `team: 'A'\|'B'`, `delta: +1\|-1`          | phase in [FIRST_HALF, SECOND_HALF], score≥0|
| `addPenalty(team, playerNum)` | `team: 'A'\|'B'`, `playerNum: number`      | phase in [FIRST_HALF, SECOND_HALF]         |
| `resetPenalty(team, playerNum)` | `team: 'A'\|'B'`, `playerNum: number`    | penalties > 0                              |
| `initiateRestMinute(team)`    | `team: 'A'\|'B'`                           | No active restMinute, clock running        |
| `tickRestMinute(deltaMs)`     | `deltaMs: number`                           | restMinute !== null                        |
| `clearRestMinute()`           | —                                           | restMinute !== null                        |
| `startSecondHalf()`           | —                                           | phase === HALF_TIME                        |
| `resetGame()`                 | —                                           | phase === ENDED                            |

---

## 3. Presentation Window Display Contract

The presentation window MUST render the following elements, sourced exclusively from the latest received `GameStateUpdatePayload`:

| Element                  | Source field(s)                                      | Display format                            |
|--------------------------|------------------------------------------------------|-------------------------------------------|
| Team A name + color      | `teamA.name`, `teamA.color`                          | Colored banner/header                     |
| Team B name + color      | `teamB.name`, `teamB.color`                          | Colored banner/header                     |
| Score                    | `scoreA`, `scoreB`                                   | Large digits: `{scoreA} – {scoreB}`       |
| Referee                  | `referee`                                            | Plain text label                          |
| Played time              | `playedTimeMs`                                       | `MM:SS` format                            |
| Phase label              | `phase`                                              | Human-readable: e.g. "First Half"         |
| Rest minute countdown    | `restMinute.remainingMs`                             | `MM:SS`, hidden when `restMinute === null`|
| Rest minute initiator    | `restMinute.initiatorTeam`                           | Team name, shown during rest minute       |
| Penalties (Team A)       | `teamA.players[].penalties`                          | One "X" per penalty per player row        |
| Penalties (Team B)       | `teamB.players[].penalties`                          | One "X" per penalty per player row        |
| Rest minute counters (A) | Count of rest minutes used by team A (derived)       | Integer counter                           |
| Rest minute counters (B) | Count of rest minutes used by team B (derived)       | Integer counter                           |

> **Note**: Rest minute counters require the state to track `restMinutesUsedA` and `restMinutesUsedB` counts in `GameState` (add to data model).

---

## 4. Configuration Window Form Contract

The configuration form MUST validate and collect:

| Field                  | Input type      | Validation                                         |
|------------------------|-----------------|----------------------------------------------------|
| Team A Name            | text            | required, 1–50 chars                               |
| Team A Color           | color picker    | required, valid hex color                          |
| Team A Players         | repeating group | at least 1 player; each player: name (required), number (unique integer ≥ 1) |
| Team B Name            | text            | required, 1–50 chars                               |
| Team B Color           | color picker    | required, valid hex color                          |
| Team B Players         | repeating group | same as Team A                                     |
| Referee                | text            | required, 1–50 chars                               |
| Half Time Length       | number          | required, integer 1–60 (minutes)                   |
| Presentation Windows   | number          | required, integer 1–10                             |

**Start Game button** is disabled until all validations pass.


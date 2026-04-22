# Data Model: Krachtbal Scoreboard

## Entities

### GameConfig
Immutable after game start (set during pre-game setup).

| Field                  | Type       | Validation                          |
|------------------------|------------|-------------------------------------|
| teamA                  | TeamConfig | required                            |
| teamB                  | TeamConfig | required                            |
| referee                | string     | required, non-empty                 |
| halfTimeLengthMinutes  | number     | required, integer, 1–60             |
| numPresentationWindows | number     | required, integer, 1–10             |

### TeamConfig
| Field   | Type     | Validation                          |
|---------|----------|-------------------------------------|
| name    | string   | required, non-empty                 |
| color   | string   | required, valid CSS color hex       |
| players | Player[] | required, at least 1 player         |

### Player
| Field     | Type   | Validation                            |
|-----------|--------|---------------------------------------|
| number    | number | required, integer ≥ 1, unique per team|
| name      | string | required, non-empty                   |
| penalties | number | default 0, integer ≥ 0               |

### GameState
Mutable during the game. Broadcast to all presentation windows on every change.

| Field              | Type              | Description                                                  |
|--------------------|-------------------|--------------------------------------------------------------|
| phase              | GamePhase         | `SETUP` \| `FIRST_HALF` \| `HALF_TIME` \| `SECOND_HALF` \| `ENDED` |
| scoreA             | number            | Team A score, integer ≥ 0                                    |
| scoreB             | number            | Team B score, integer ≥ 0                                    |
| playedTimeMs       | number            | Elapsed play time in milliseconds                            |
| halfTimeLengthMs   | number            | Total half length in milliseconds (derived from config)      |
| clockRunning       | boolean           | Whether the play clock is ticking                            |
| restMinute         | RestMinuteState \| null | Active rest minute, or null                           |
| teamA              | TeamConfig        | Snapshot from config (with live penalty counts)              |
| teamB              | TeamConfig        | Snapshot from config (with live penalty counts)              |
| referee            | string            | Snapshot from config                                         |

### GamePhase (enum)
```
SETUP → FIRST_HALF → HALF_TIME → SECOND_HALF → ENDED
```

### RestMinuteState
| Field          | Type    | Description                                      |
|----------------|---------|--------------------------------------------------|
| initiatorTeam  | 'A' \| 'B' | Which team called the rest minute             |
| remainingMs    | number  | Countdown remaining in milliseconds              |
| buzzerFired    | boolean | Whether the buzzer was triggered at start        |

## State Transitions

```
SETUP
  → [startGame action] → FIRST_HALF (clock paused)

FIRST_HALF
  → [clock running, playedTimeMs >= halfTimeLengthMs] → HALF_TIME (buzzer fires, clock stops)
  → [startSecondHalf action] → (blocked until HALF_TIME)

HALF_TIME
  → [startSecondHalf action] → SECOND_HALF (clock reset to 0, paused)

SECOND_HALF
  → [clock running, playedTimeMs >= halfTimeLengthMs] → ENDED (buzzer fires, clock stops)

ENDED
  → [resetGame action] → SETUP (all data cleared, presentation windows closed)
```

## Validation Rules

- Game cannot transition out of `SETUP` if any required config field is missing (FR-002).
- Score cannot go below 0.
- Penalties cannot go below 0 per player.
- Rest minute can only be initiated during `FIRST_HALF` or `SECOND_HALF` when clock is running.
- At most one active rest minute at a time.
- `numPresentationWindows` is locked once `phase !== SETUP`.


# Feature Specification: Krachtbal Scoreboard

**Feature Branch**: `[001-krachtbal-scoreboard]`  
**Created**: 2024-06-09  
**Status**: Draft  
**Input**: User description: "Create or update the feature specification for a krachtbal scoreboard application. The app must have: (1) a configuration window for pre-game setup (team names, colors, player names/numbers, referee, half time length, number of presentation windows, start game), (2) in-game controls (show/play time, time left, score adjustment, penalty tracking and reset, rest minute management with initiator popup and buzzer, rest minute counters, countdown clock, half time/end time buzzers, start second half), (3) post-game reset (reset all data, close presentation windows), and (4) presentation windows (showing synchronized game state: team names/colors, referee, played time, rest minute countdown, rest minute counters, penalties as Xs). All presentation windows must be identical and configurable in number. The configuration window controls all state and presentation windows. Ensure all requirements and edge cases are covered."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pre-game Setup (Priority: P1)

As a game official, I want to configure all game parameters (team names, colors, player names/numbers, referee, half time length, number of presentation windows) before the game starts, so that the game and its presentation windows are ready and accurate.

**Why this priority**: The game cannot start without correct setup; all subsequent flows depend on this.

**Independent Test**: Complete configuration, start game, verify all presentation windows reflect the setup.

**Acceptance Scenarios**:

1. **Given** the app is opened, **When** the official enters all required configuration and starts the game, **Then** all presentation windows open and display the correct initial state.
2. **Given** incomplete configuration, **When** the official tries to start the game, **Then** the system prevents starting and highlights missing fields.

---

### User Story 2 - In-game Control (Priority: P2)

As a game official, I want to control the game state (play/pause time, adjust scores, track/reset penalties, manage rest minutes, trigger buzzers, start second half) so that the game is accurately managed and reflected in all presentation windows.

**Why this priority**: Accurate in-game control is essential for fair play and real-time display.

**Independent Test**: Adjust scores, trigger penalties, manage rest minutes, and verify all changes are instantly reflected in all presentation windows.

**Acceptance Scenarios**:

1. **Given** the game is running, **When** the official adjusts the score, **Then** the new score is shown on all presentation windows.
2. **Given** a penalty is assigned or reset, **When** the official updates penalties, **Then** the penalty state is updated on all presentation windows.
3. **Given** a rest minute is initiated, **When** the official triggers a rest minute, **Then** a popup appears to select the initiator, the buzzer sounds, and the countdown is shown on all presentation windows.
4. **Given** the half time or end time is reached, **When** the clock runs out, **Then** the buzzer sounds and the state is updated accordingly.

---

### User Story 3 - Post-game Reset (Priority: P3)

As a game official, I want to reset all game data and close all presentation windows after the game, so the system is ready for the next match.

**Why this priority**: Ensures clean state for future games and prevents data leakage.

**Independent Test**: Complete a game, trigger reset, verify all data is cleared and presentation windows are closed.

**Acceptance Scenarios**:

1. **Given** the game has ended, **When** the official triggers reset, **Then** all data is cleared and all presentation windows are closed.

---

### User Story 4 - Presentation Windows (Priority: P4)

As a spectator or official, I want each presentation window to show the synchronized game state (team names/colors, referee, played time, rest minute countdown, rest minute counters, penalties as Xs), so that everyone sees the same, up-to-date information.

**Why this priority**: Consistency and clarity for all viewers is critical.

**Independent Test**: Open multiple presentation windows, perform in-game actions, verify all windows update identically and in real time.

**Acceptance Scenarios**:

1. **Given** multiple presentation windows are open, **When** the official updates any game state, **Then** all windows reflect the change instantly and identically.

---

### Edge Cases

- What happens if a presentation window is closed and reopened during a game? (It should resync to current state.)
- How does the system handle network or display errors in a presentation window? (Should attempt to reconnect or notify the official.)
- What if two officials try to control the game simultaneously? Not possible
- What if the number of presentation windows is changed mid-game? (Should only be configurable pre-game; mid-game changes are ignored or blocked.)
- How are penalties tracked if a player is substituted? Penalties are linked to the team, not the player.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a configuration window for pre-game setup, including team names, team colors, player names/numbers, referee, half time length, and number of presentation windows.
- **FR-002**: System MUST prevent starting the game until all required configuration fields are completed.
- **FR-003**: System MUST allow the official to start the game, which opens the specified number of synchronized presentation windows.
- **FR-004**: System MUST provide in-game controls for play/pause time, time left, score adjustment, penalty tracking and reset, rest minute management (with initiator popup and buzzer), rest minute counters, countdown clock, and half time/end time buzzers.
- **FR-005**: System MUST allow starting the second half after half time.
- **FR-006**: System MUST allow post-game reset, clearing all data and closing all presentation windows.
- **FR-007**: System MUST ensure all presentation windows display identical, synchronized game state, including team names/colors, referee, played time, rest minute countdown, rest minute counters, and penalties as Xs.
- **FR-008**: System MUST allow presentation windows to reconnect and resynchronize if closed and reopened during a game.
- **FR-009**: System MUST handle network or display errors in presentation windows gracefully, attempting to reconnect or notifying the official.
- **FR-010**: System MUST ensure penalties are tracked per player number, not position, even if substitutions occur.
- **FR-011**: System MUST restrict the number of presentation windows to be set only during pre-game configuration; changes mid-game are blocked.
- **FR-012**: System MUST only allow one controller for the game

### Key Entities

- **Game**: Represents a single match, including configuration, state, and timing.
- **Team**: Name, color, list of players.
- **Player**: Name, number, penalties.
- **Referee**: Name.
- **Presentation Window**: Display instance showing synchronized game state.
- **Penalty**: Associated with player number, tracked as Xs.
- **Rest Minute**: Countdown, initiator, and buzzer state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Officials can complete pre-game setup and start the game in under 2 minutes.
- **SC-002**: All presentation windows display identical, synchronized state within 1 second of any change.
- **SC-003**: 100% of in-game actions (score, penalties, rest minutes) are reflected in all presentation windows without error.
- **SC-004**: Officials can reset the game and close all presentation windows in under 30 seconds post-game.
- **SC-005**: System recovers from presentation window disconnects within 5 seconds, resynchronizing state automatically.
- **SC-006**: 95% of games are completed without user-reported synchronization or control issues.

## Assumptions

- Users are game officials or event staff familiar with krachtbal rules.
- All presentation windows are on the same local network or have reliable connectivity.
- Only one game is managed at a time per instance of the application.
- Penalties are always tracked by player number, not by position or name.
- Presentation window count is fixed for the duration of a game.
- [Dependency] The system relies on the underlying OS/browser to handle window management and audio (buzzers).


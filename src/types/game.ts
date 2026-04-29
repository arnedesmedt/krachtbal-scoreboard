export type GamePhase = 'SETUP' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'THIRD_HALF' | 'FOURTH_HALF' | 'ENDED';

export type RestMinuteInitiator = 'A' | 'B' | 'referee';

export interface TeamConfig {
  name: string;
  color: string;
  color2: string;
}

export interface GameConfig {
  gameId: string;
  teamA: TeamConfig;
  teamB: TeamConfig;
  referee: string;
  league: string;
  halfTimeLengthMinutes: number;
}

export interface RestMinuteState {
  initiatorTeam: RestMinuteInitiator | null; // null = pending assignment
  remainingMs: number;
  buzzerFired5s: boolean;
}

export interface RestMinutesPerHalf {
  FIRST_HALF: number;
  SECOND_HALF: number;
  THIRD_HALF: number;
  FOURTH_HALF: number;
}

export type PresentationTheme = 'dark' | 'light';

export interface GameState {
  phase: GamePhase;
  config: GameConfig | null;
  scoreA: number;
  scoreB: number;
  penaltiesA: number; // 0–3, cycles back to 0 after 3
  penaltiesB: number;
  playedTimeMs: number;
  clockRunning: boolean;
  restMinute: RestMinuteState | null;
  restMinutesUsedA: RestMinutesPerHalf;
  restMinutesUsedB: RestMinutesPerHalf;
  restMinutesUsedReferee: RestMinutesPerHalf;
  presentationTheme: PresentationTheme;
  halvesPlayed: ('FIRST_HALF' | 'SECOND_HALF' | 'THIRD_HALF' | 'FOURTH_HALF')[];
  // Timing persistence fields
  halfStartTimeMs: number | null; // When the current half started
  restMinuteStartTimeMs: number | null; // When the current rest minute started
  lastSavedTimeMs: number | null; // When the state was last saved (for calculating elapsed time)
}

export type GameStateUpdatePayload = {
  phase: GamePhase;
  scoreA: number;
  scoreB: number;
  penaltiesA: number;
  penaltiesB: number;
  playedTimeMs: number;
  halfTimeLengthMs: number;
  clockRunning: boolean;
  restMinute: RestMinuteState | null;
  teamA: { name: string; color: string; color2: string };
  teamB: { name: string; color: string; color2: string };
  referee: string;
  league: string;
  restMinutesUsedA: RestMinutesPerHalf;
  restMinutesUsedB: RestMinutesPerHalf;
  restMinutesUsedReferee: RestMinutesPerHalf;
  presentationTheme: PresentationTheme;
};

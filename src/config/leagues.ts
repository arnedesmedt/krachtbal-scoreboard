export interface League {
  id: string;
  name: string;
  durationMinutes: number;
}

export const LEAGUES: League[] = [
  {
    id: 'u12',
    name: 'U12',
    durationMinutes: 20
  },
  {
    id: 'u14',
    name: 'U14',
    durationMinutes: 20
  },
  {
    id: 'u16',
    name: 'U16',
    durationMinutes: 20
  },
  {
    id: 'u18',
    name: 'U18',
    durationMinutes: 25
  },
  {
    id: 'seniors',
    name: 'Seniors',
    durationMinutes: 25
  },
  {
    id: 'veterans',
    name: 'Veterans',
    durationMinutes: 25
  }
];

export function getLeagueById(id: string): League | undefined {
  return LEAGUES.find(league => league.id === id);
}

export function getLeagueDurationMinutes(leagueId: string): number {
  const league = getLeagueById(leagueId);
  return league?.durationMinutes || 25; // Default to 25 minutes
}

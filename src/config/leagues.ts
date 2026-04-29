export interface League {
  id: string;
  name: string;
  durationMinutes: number;
}

export const LEAGUES: League[] = [
  {
    id: 'hoger-heren',
    name: 'Hoger Heren',
    durationMinutes: 25
  },
  {
    id: 'hoger-dames',
    name: 'Hoger Dames',
    durationMinutes: 1
  },
  {
    id: 'lager-heren',
    name: 'Lager Heren',
    durationMinutes: 25
  },
  {
    id: 'lager-dames',
    name: 'Lager Dames',
    durationMinutes: 25
  },
  {
    id: 'u18-jongens',
    name: 'U18 Jongens',
    durationMinutes: 25
  },
  {
    id: 'u18-meisjes',
    name: 'U18 Meisjes',
    durationMinutes: 25
  },
  {
    id: 'u16-jongens',
    name: 'U16 Jongens',
    durationMinutes: 20
  },
  {
    id: 'u16-meisjes',
    name: 'U16 Meisjes',
    durationMinutes: 20
  },
  {
    id: 'u14-jongens',
    name: 'U14 Jongens',
    durationMinutes: 20
  },
  {
    id: 'u14-meisjes',
    name: 'U14 Meisjes',
    durationMinutes: 20
  },
  {
    id: 'u12',
    name: 'U12',
    durationMinutes: 20
  }
];

export function getLeagueById(id: string): League | undefined {
  return LEAGUES.find(league => league.id === id);
}

export function getLeagueDurationMinutes(leagueId: string): number {
  const league = getLeagueById(leagueId);
  return league?.durationMinutes || 25; // Default to 25 minutes
}

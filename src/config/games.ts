export interface Game {
  id: string;
  datetime: string; // ISO string
  homeTeamId: string;
  awayTeamId: string;
  refereeId: string;
  leagueId: string;
}

export const GAMES: Game[] = [
  {
    id: 'game-1',
    datetime: '2026-05-30T09:30:00',
    homeTeamId: 'team-kbc-male',
    awayTeamId: 'team-noordster-dudzele',
    refereeId: 'ref-1',
    leagueId: 'lager-dames'
  },
  {
    id: 'game-2',
    datetime: '2026-05-30T09:45:00',
    homeTeamId: 'team-atlas-varsenare',
    awayTeamId: 'team-kbk-temse',
    refereeId: 'ref-1',
    leagueId: 'lager-heren'
  },
  {
    id: 'game-3',
    datetime: '2026-05-30T10:45:00',
    homeTeamId: 'team-kbc-st-michiels',
    awayTeamId: 'team-klaverken-buggenhout',
    refereeId: 'ref-1',
    leagueId: 'u12'
  },
  {
    id: 'game-4',
    datetime: '2026-05-30T11:00:00',
    homeTeamId: 'team-ho-beitem',
    awayTeamId: 'team-krachtbal-snellegem',
    refereeId: 'ref-1',
    leagueId: 'u14-jongens'
  },
  {
    id: 'game-5',
    datetime: '2026-05-30T11:45:00',
    homeTeamId: 'team-botterken-baasrode',
    awayTeamId: 'team-ho-beitem',
    refereeId: 'ref-1',
    leagueId: 'u14-meisjes'
  },
  {
    id: 'game-6',
    datetime: '2026-05-30T12:00:00',
    homeTeamId: 'team-dw-koekelare',
    awayTeamId: 'team-krb-jabbeke',
    refereeId: 'ref-1',
    leagueId: 'u16-jongens'
  },
  {
    id: 'game-7',
    datetime: '2026-05-30T12:45:00',
    homeTeamId: 'team-dw-koekelare',
    awayTeamId: 'team-noordster-dudzele',
    refereeId: 'ref-1',
    leagueId: 'u16-meisjes'
  },
  {
    id: 'game-8',
    datetime: '2026-05-30T13:00:00',
    homeTeamId: 'team-klaverken-buggenhout',
    awayTeamId: 'team-krb-jabbeke',
    refereeId: 'ref-1',
    leagueId: 'u18-meisjes'
  },
  {
    id: 'game-9',
    datetime: '2026-05-30T13:45:00',
    homeTeamId: '',
    awayTeamId: 'team-klaverken-buggenhout',
    refereeId: 'ref-1',
    leagueId: 'u18-jongens'
  },
  {
    id: 'game-10',
    datetime: '2026-05-30T15:00:00',
    homeTeamId: 'team-kbc-st-michiels',
    awayTeamId: 'team-botterken-baasrode',
    refereeId: 'ref-1',
    leagueId: 'hoger-dames'
  },
  {
    id: 'game-11',
    datetime: '2026-05-30T16:15:00',
    homeTeamId: 'team-kbc-st-michiels',
    awayTeamId: 'team-kbc-male',
    refereeId: 'ref-1',
    leagueId: 'hoger-heren'
  },
  {
    id: 'game-12',
    datetime: '2026-05-17T09:00:00',
    homeTeamId: 'team-kbk-ichtegem',
    awayTeamId: 'team-kbc-aalter',
    refereeId: 'ref-69',
    leagueId: 'lager-heren'
  },
  {
    id: 'game-13',
    datetime: '2026-05-17T10:15:00',
    homeTeamId: 'team-kbk-ichtegem',
    awayTeamId: 'team-kbk-temse',
    refereeId: 'ref-69',
    leagueId: 'lager-dames'
  },
  {
    id: 'game-14',
    datetime: '2026-05-17T11:30:00',
    homeTeamId: 'team-kbk-ichtegem',
    awayTeamId: 'team-vrij',
    refereeId: 'ref-1',
    leagueId: 'lager-dames'
  },
  {
    id: 'game-15',
    datetime: '2026-05-17T11:30:00',
    homeTeamId: 'team-kbk-ichtegem-a',
    awayTeamId: 'team-kbk-ichtegem-b',
    refereeId: 'ref-69',
    leagueId: 'u18-jongens'
  }
];

export function getGameById(id: string): Game | undefined {
  return GAMES.find(game => game.id === id);
}

export function getGameClosestToNow(): Game | undefined {
  const now = new Date();
  const nowTime = now.getTime();
  
  return GAMES.reduce((closest, game) => {
    const gameTime = new Date(game.datetime).getTime();
    const closestTime = closest ? new Date(closest.datetime).getTime() : Infinity;

    // If this game is closer to now than the current closest, use it
    if (Math.abs(gameTime - nowTime) < Math.abs(closestTime - nowTime)) {
      return game;
    }
    
    return closest;
  }, undefined as Game | undefined);
}

export function getUpcomingGames(): Game[] {
  const now = new Date();
  return GAMES
    .filter(game => new Date(game.datetime) >= now)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
}

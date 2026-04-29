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
    datetime: '2026-04-29T10:00:00',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    refereeId: 'ref-1',
    leagueId: 'u14-jongens'
  },
  {
    id: 'game-2',
    datetime: '2026-04-29T11:30:00',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    refereeId: 'ref-2',
    leagueId: 'u16-jongens'
  },
  {
    id: 'game-3',
    datetime: '2026-04-29T13:00:00',
    homeTeamId: 'team-5',
    awayTeamId: 'team-6',
    refereeId: 'ref-3',
    leagueId: 'u18-jongens'
  },
  {
    id: 'game-4',
    datetime: '2026-04-29T14:30:00',
    homeTeamId: 'team-2',
    awayTeamId: 'team-3',
    refereeId: 'ref-4',
    leagueId: 'hoger-heren'
  },
  {
    id: 'game-5',
    datetime: '2026-04-29T16:00:00',
    homeTeamId: 'team-1',
    awayTeamId: 'team-4',
    refereeId: 'ref-5',
    leagueId: 'hoger-dames'
  },
  {
    id: 'game-6',
    datetime: '2026-04-30T10:00:00',
    homeTeamId: 'team-6',
    awayTeamId: 'team-1',
    refereeId: 'ref-6',
    leagueId: 'u12'
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

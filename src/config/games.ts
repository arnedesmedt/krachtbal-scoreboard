export interface Game {
  id: string;
  datetime: string; // ISO string
  homeTeamId: string;
  awayTeamId: string;
  referee: string;
  leagueId: string;
}

export const GAMES: Game[] = [
  {
    id: 'game-1',
    datetime: '2026-04-29T10:00:00',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    referee: 'Jan Janssen',
    leagueId: 'u14'
  },
  {
    id: 'game-2',
    datetime: '2026-04-29T11:30:00',
    homeTeamId: 'team-3',
    awayTeamId: 'team-4',
    referee: 'Piet Pietersen',
    leagueId: 'u16'
  },
  {
    id: 'game-3',
    datetime: '2026-04-29T13:00:00',
    homeTeamId: 'team-5',
    awayTeamId: 'team-6',
    referee: 'Karel De Smet',
    leagueId: 'u18'
  },
  {
    id: 'game-4',
    datetime: '2026-04-29T14:30:00',
    homeTeamId: 'team-2',
    awayTeamId: 'team-3',
    referee: 'Tom Van Damme',
    leagueId: 'seniors'
  },
  {
    id: 'game-5',
    datetime: '2026-04-29T16:00:00',
    homeTeamId: 'team-1',
    awayTeamId: 'team-4',
    referee: 'Luc Verbeeck',
    leagueId: 'veterans'
  },
  {
    id: 'game-6',
    datetime: '2026-04-30T10:00:00',
    homeTeamId: 'team-6',
    awayTeamId: 'team-1',
    referee: 'Marie Verhoeven',
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
    
    // If the game is in the past, skip it
    if (gameTime < nowTime) return closest;
    
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

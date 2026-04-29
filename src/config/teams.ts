export interface Team {
  id: string;
  name: string;
  color: string;
  color2: string;
}

export const TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Krachtbal A',
    color: '#ef4444',
    color2: '#ffffff'
  },
  {
    id: 'team-2',
    name: 'Krachtbal B',
    color: '#3b82f6',
    color2: '#ffffff'
  },
  {
    id: 'team-3',
    name: 'De Schoppers',
    color: '#10b981',
    color2: '#ffffff'
  },
  {
    id: 'team-4',
    name: 'De Bikkels',
    color: '#f59e0b',
    color2: '#ffffff'
  },
  {
    id: 'team-5',
    name: 'De Strijders',
    color: '#8b5cf6',
    color2: '#ffffff'
  },
  {
    id: 'team-6',
    name: 'De Kampioenen',
    color: '#ec4899',
    color2: '#ffffff'
  }
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find(team => team.id === id);
}

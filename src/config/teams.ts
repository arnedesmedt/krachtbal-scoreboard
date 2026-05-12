export interface Team {
  id: string;
  name: string;
  color: string;
  color2: string;
}

export const TEAMS: Team[] = [
  {
    id: 'team-kbc-st-michiels',
    name: 'KBC St. Michiels',
    color: '#dc2626',
    color2: '#ffffff'
  },
  {
    id: 'team-kbc-male',
    name: 'KBC Male',
    color: '#1d4ed8',
    color2: '#ffffff'
  },
  {
    id: 'team-botterken-baasrode',
    name: "'t Botterken Baasrode",
    color: '#16a34a',
    color2: '#ffffff'
  },
  {
    id: 'team-atlas-varsenare',
    name: 'Atlas Varsenare',
    color: '#ea580c',
    color2: '#ffffff'
  },
  {
    id: 'team-kbk-temse',
    name: 'KBK Temse',
    color: '#7c3aed',
    color2: '#ffffff'
  },
  {
    id: 'team-klaverken-buggenhout',
    name: "'t Klaverken Buggenhout",
    color: '#eab308',
    color2: '#000000'
  },
  {
    id: 'team-noordster-dudzele',
    name: 'Noordster Dudzele',
    color: '#0d9488',
    color2: '#ffffff'
  },
  {
    id: 'team-ho-beitem',
    name: 'HO Beitem',
    color: '#db2777',
    color2: '#ffffff'
  },
  {
    id: 'team-krachtbal-snellegem',
    name: 'Krachtbal Snellegem',
    color: '#4338ca',
    color2: '#ffffff'
  },
  {
    id: 'team-dw-koekelare',
    name: 'D&W Koekelare',
    color: '#991b1b',
    color2: '#ffffff'
  },
  {
    id: 'team-krb-jabbeke',
    name: 'KRB Jabbeke',
    color: '#0284c7',
    color2: '#ffffff'
  },
  {
    id: 'team-kbk-ichtegem',
    name: 'KBK Ichtegem',
    color: '#1e40af',
    color2: '#ffffff'
  },
  {
    id: 'team-kbk-ichtegem-a',
    name: 'KBK Ichtegem A',
    color: '#1e40af',
    color2: '#ffffff'
  },
  {
    id: 'team-kbk-ichtegem-b',
    name: 'KBK Ichtegem B',
    color: '#1e40af',
    color2: '#fbbf24'
  },
  {
    id: 'team-kbc-aalter',
    name: 'KBC Aalter',
    color: '#15803d',
    color2: '#ffffff'
  },
  {
    id: 'team-vrij',
    name: 'Vrij',
    color: '#6b7280',
    color2: '#ffffff'
  }
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find(team => team.id === id);
}

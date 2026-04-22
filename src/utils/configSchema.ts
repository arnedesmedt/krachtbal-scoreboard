import { z } from 'zod';

const teamConfigSchema = z.object({
  name: z.string().min(1, 'Teamnaam is verplicht').max(50, 'Teamnaam max 50 tekens'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Kleur moet een geldige hexkleur zijn (bijv. #FF0000)'),
  color2: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Kleur moet een geldige hexkleur zijn (bijv. #FF0000)'),
});

export const gameConfigSchema = z.object({
  teamA: teamConfigSchema,
  teamB: teamConfigSchema,
  referee: z.string().min(1, 'Scheidsrechter is verplicht').max(50, 'Naam scheidsrechter max 50 tekens'),
  league: z.string().min(1, 'Competitie is verplicht').max(100, 'Competitienaam max 100 tekens'),
  halfTimeLengthMinutes: z
    .number()
    .int()
    .min(1, 'Speeltijd moet minstens 1 minuut zijn')
    .max(60, 'Speeltijd max 60 minuten'),
});

export type GameConfigFormData = z.infer<typeof gameConfigSchema>;

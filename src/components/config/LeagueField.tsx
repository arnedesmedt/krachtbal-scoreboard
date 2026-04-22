 import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';
import { LEAGUES } from '../../data/leagues';

export function LeagueField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">Competitie</label>
      <select
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        {...register('league')}
      >
        <option value="">— Kies een competitie —</option>
        {LEAGUES.map((league) => (
          <option key={league} value={league}>
            {league}
          </option>
        ))}
      </select>
      {errors.league && <p className="text-red-500 text-xs mt-1">{errors.league.message}</p>}
    </div>
  );
}

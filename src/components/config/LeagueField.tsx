import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';

export function LeagueField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">Competitie</label>
      <input
        type="text"
        placeholder="bijv. Nationale Liga A"
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...register('league')}
      />
      {errors.league && <p className="text-red-500 text-xs mt-1">{errors.league.message}</p>}
    </div>
  );
}


import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';
import { REFEREES } from '../../data/referees';

export function RefereeField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">Scheidsrechter</label>
      <select
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        {...register('referee')}
      >
        <option value="">— Kies een scheidsrechter —</option>
        {REFEREES.map((referee) => (
          <option key={referee} value={referee}>
            {referee}
          </option>
        ))}
      </select>
      {errors.referee && <p className="text-red-500 text-xs mt-1">{errors.referee.message}</p>}
    </div>
  );
}

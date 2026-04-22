import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';

export function HalfTimeLengthField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        Speeltijd per helft (min)
      </label>
      <input
        type="number"
        min={1}
        max={60}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        {...register('halfTimeLengthMinutes', { valueAsNumber: true })}
      />
      {errors.halfTimeLengthMinutes && (
        <p className="text-red-500 text-xs mt-1">
          {errors.halfTimeLengthMinutes.message}
        </p>
      )}
    </div>
  );
}

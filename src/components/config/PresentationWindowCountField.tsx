import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';
import { useGameStore } from '../../store/gameStore';

export function PresentationWindowCountField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();
  const phase = useGameStore((s) => s.phase);
  const isDisabled = phase !== 'SETUP';

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">Presentation Windows</label>
      <input
        type="number"
        min={1}
        max={10}
        disabled={isDisabled}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        {...register('numPresentationWindows', { valueAsNumber: true })}
      />
      {errors.numPresentationWindows && <p className="text-red-500 text-xs mt-1">{errors.numPresentationWindows.message}</p>}
    </div>
  );
}

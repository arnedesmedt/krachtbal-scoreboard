import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';

interface TeamConfigFormProps {
  teamKey: 'teamA' | 'teamB';
  label: string;
}

export function TeamConfigForm({ teamKey, label }: TeamConfigFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  const teamErrors = errors[teamKey];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-700 mb-4">{label}</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1">Teamnaam</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          {...register(`${teamKey}.name`)}
        />
        {teamErrors?.name && <p className="text-red-500 text-xs mt-1">{teamErrors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">Primaire kleur</label>
        <input
          type="color"
          className="h-10 w-20 rounded cursor-pointer border border-slate-300"
          {...register(`${teamKey}.color`)}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-600 mb-1">Secundaire kleur</label>
        <input
          type="color"
          className="h-10 w-20 rounded cursor-pointer border border-slate-300"
          {...register(`${teamKey}.color2`)}
        />
      </div>
    </div>
  );
}

import { useFormContext } from 'react-hook-form';
import type { GameConfigFormData } from '../../utils/configSchema';

interface PlayerRowProps {
  teamKey: 'teamA' | 'teamB';
  index: number;
  onRemove: () => void;
}

export function PlayerRow({ teamKey, index, onRemove }: PlayerRowProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<GameConfigFormData>();

  const playerErrors = errors[teamKey]?.players?.[index];

  return (
    <div className="flex gap-2 items-start">
      <div className="w-16">
        <input
          type="number"
          placeholder="#"
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          {...register(`${teamKey}.players.${index}.number`, { valueAsNumber: true })}
        />
        {playerErrors?.number && <p className="text-red-500 text-xs mt-0.5">{playerErrors.number.message}</p>}
      </div>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Naam speler"
          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          {...register(`${teamKey}.players.${index}.name`)}
        />
        {playerErrors?.name && <p className="text-red-500 text-xs mt-0.5">{playerErrors.name.message}</p>}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove player"
        className="mt-1 text-slate-400 hover:text-red-500 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}

import { useFormState } from 'react-hook-form';

export function StartGameButton() {
  const { isValid } = useFormState();

  return (
    <button
      type="submit"
      disabled={!isValid}
      className="px-10 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-lg shadow transition-colors"
    >
      Start wedstrijd
    </button>
  );
}

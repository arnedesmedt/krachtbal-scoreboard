import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gameConfigSchema, type GameConfigFormData } from '../../utils/configSchema';
import { TeamConfigForm } from './TeamConfigForm';
import { RefereeField } from './RefereeField';
import { HalfTimeLengthField } from './HalfTimeLengthField';
import { LeagueField } from './LeagueField';
import { StartGameButton } from './StartGameButton';
import { useGameStore } from '../../store/gameStore';

export function ConfigWindow() {
  const setConfig = useGameStore((s) => s.setConfig);

  const methods = useForm<GameConfigFormData>({
    resolver: zodResolver(gameConfigSchema),
    defaultValues: {
      teamA: { name: '', color: '#ef4444', color2: '#ffffff' },
      teamB: { name: '', color: '#3b82f6', color2: '#ffffff' },
      referee: '',
      league: '',
      halfTimeLengthMinutes: 25,
    },
    mode: 'onChange',
  });

  const startGame = useGameStore((s) => s.startGame);

  const onSubmit = (data: GameConfigFormData) => {
    setConfig(data);
    startGame();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Krachtbal Scoreboard</h1>
            <p className="text-slate-500 mt-1">Voorbereiding wedstrijd</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TeamConfigForm teamKey="teamA" label="Thuisploeg" />
            <TeamConfigForm teamKey="teamB" label="Uitploeg" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <RefereeField />
            <LeagueField />
            <HalfTimeLengthField />
          </div>

          <div className="flex justify-center">
            <StartGameButton />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}


import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GAMES, getGameById, getGameClosestToNow, getRefereeById } from '../../config';
import { getTeamById } from '../../config';
import { getLeagueById } from '../../config';
import type { GameConfig } from '../../types/game';

export function GameSelection() {
  const setConfig = useGameStore((s) => s.setConfig);
  const startGame = useGameStore((s) => s.startGame);
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  // Auto-select the game closest to current time
  useEffect(() => {
    const closestGame = getGameClosestToNow();
    if (closestGame) {
      setSelectedGameId(closestGame.id);
    }
  }, []);

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
  };

  const handleStartGame = () => {
    if (!selectedGameId) return;

    const game = getGameById(selectedGameId);
    if (!game) return;

    const homeTeam = getTeamById(game.homeTeamId);
    const awayTeam = getTeamById(game.awayTeamId);
    const league = getLeagueById(game.leagueId);
    const referee = getRefereeById(game.refereeId);

    if (!homeTeam || !awayTeam || !league || !referee) {
      console.error('Invalid game configuration');
      return;
    }

    const config: GameConfig = {
      gameId: game.id,
      teamA: {
        name: homeTeam.name,
        color: homeTeam.color,
        color2: homeTeam.color2
      },
      teamB: {
        name: awayTeam.name,
        color: awayTeam.color,
        color2: awayTeam.color2
      },
      referee: referee.name,
      league: league.name,
      halfTimeLengthMinutes: league.durationMinutes
    };

    setConfig(config);
    startGame();
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleString('nl-BE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedGame = selectedGameId ? getGameById(selectedGameId) : null;
  const homeTeam = selectedGame ? getTeamById(selectedGame.homeTeamId) : null;
  const awayTeam = selectedGame ? getTeamById(selectedGame.awayTeamId) : null;
  const league = selectedGame ? getLeagueById(selectedGame.leagueId) : null;
  const referee = selectedGame ? getRefereeById(selectedGame.refereeId) : null;

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="w-full h-full flex flex-col p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Krachtbal Scoreboard</h1>
          </div>
          <p className="text-slate-600 text-lg">Selecteer een wedstrijd om te beginnen</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📅</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Beschikbare wedstrijden</h2>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-96 pr-2">
            {GAMES.map((game) => {
              const gameHomeTeam = getTeamById(game.homeTeamId);
              const gameAwayTeam = getTeamById(game.awayTeamId);
              const gameLeague = getLeagueById(game.leagueId);
              const gameReferee = getRefereeById(game.refereeId);
              
              if (!gameHomeTeam || !gameAwayTeam || !gameLeague || !gameReferee) return null;

              return (
                <div
                  key={game.id}
                  className={`group relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedGameId === game.id
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                      : 'border-slate-200/50 bg-white/50 hover:border-blue-300 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-600">
                        {formatDateTime(game.datetime)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-lg text-xs font-bold shadow-sm border border-slate-200/50">
                          {gameLeague.name}
                        </div>
                        <div className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-xs font-bold shadow-sm border border-green-200/50">
                          {gameLeague.durationMinutes}min
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="relative flex-shrink-0">
                        <span
                          className="inline-block px-2 py-1 rounded-lg text-white text-xs font-bold shadow-md"
                          style={{ backgroundColor: gameHomeTeam.color }}
                        >
                          {gameHomeTeam.name}
                        </span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className="text-slate-400 text-xs font-medium">VS</span>
                      </div>
                      <div className="relative flex-shrink-0">
                        <span
                          className="inline-block px-2 py-1 rounded-lg text-white text-xs font-bold shadow-md"
                          style={{ backgroundColor: gameAwayTeam.color }}
                        >
                          {gameAwayTeam.name}
                        </span>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs">👤</span>
                    </div>
                    <span className="font-medium">{gameReferee.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedGame && homeTeam && awayTeam && league && referee && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Geselecteerde wedstrijd</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <div
                    className="px-6 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                    style={{ backgroundColor: homeTeam.color }}
                  >
                    {homeTeam.name}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-xs">🏠</span>
                  </div>
                </div>
                <div className="text-sm text-slate-600 font-medium">Thuisploeg</div>
              </div>
              <div className="text-center">
                <div className="relative inline-block mb-3">
                  <div
                    className="px-6 py-3 rounded-xl text-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform"
                    style={{ backgroundColor: awayTeam.color }}
                  >
                    {awayTeam.name}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-xs">✈️</span>
                  </div>
                </div>
                <div className="text-sm text-slate-600 font-medium">Uitploeg</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-sm">👤</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">Scheidsrechter</div>
                <div className="text-slate-600 font-medium">{referee.name}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-sm">🏆</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">Competitie</div>
                <div className="text-slate-600 font-medium">{league.name}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <span className="text-white text-sm">⏱️</span>
                </div>
                <div className="font-bold text-slate-800 text-sm">Speelduur</div>
                <div className="text-slate-600 font-medium">{league.durationMinutes} minuten</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleStartGame}
            disabled={!selectedGameId}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🚀</span>
              <span>Start wedstrijd</span>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

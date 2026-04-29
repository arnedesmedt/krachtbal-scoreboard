import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { GAMES, getGameById, getGameClosestToNow, getUpcomingGames } from '../../config';
import { getTeamById } from '../../config';
import { getLeagueById } from '../../config';
import type { GameConfig } from '../../types/game';

export function GameSelection() {
  const setConfig = useGameStore((s) => s.setConfig);
  const startGame = useGameStore((s) => s.startGame);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [games, setGames] = useState(GAMES);

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

    if (!homeTeam || !awayTeam || !league) {
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
      referee: game.referee,
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Krachtbal Scoreboard</h1>
          <p className="text-slate-500 mt-1">Selecteer een wedstrijd</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Beschikbare wedstrijden</h2>
          
          <div className="space-y-3">
            {games.map((game) => {
              const gameHomeTeam = getTeamById(game.homeTeamId);
              const gameAwayTeam = getTeamById(game.awayTeamId);
              const gameLeague = getLeagueById(game.leagueId);
              
              if (!gameHomeTeam || !gameAwayTeam || !gameLeague) return null;

              return (
                <div
                  key={game.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedGameId === game.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-slate-600">
                        {formatDateTime(game.datetime)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className="px-2 py-1 rounded text-white text-sm font-medium"
                          style={{ backgroundColor: gameHomeTeam.color }}
                        >
                          {gameHomeTeam.name}
                        </span>
                        <span className="text-slate-400">vs</span>
                        <span
                          className="px-2 py-1 rounded text-white text-sm font-medium"
                          style={{ backgroundColor: gameAwayTeam.color }}
                        >
                          {gameAwayTeam.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                        {gameLeague.name}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {gameLeague.durationMinutes}min
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    Scheidsrechter: {game.referee}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedGame && homeTeam && awayTeam && league && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Geselecteerde wedstrijd</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div
                  className="inline-block px-4 py-2 rounded-lg text-white font-bold mb-2"
                  style={{ backgroundColor: homeTeam.color }}
                >
                  {homeTeam.name}
                </div>
                <div className="text-sm text-slate-500">Thuisploeg</div>
              </div>
              <div className="text-center">
                <div
                  className="inline-block px-4 py-2 rounded-lg text-white font-bold mb-2"
                  style={{ backgroundColor: awayTeam.color }}
                >
                  {awayTeam.name}
                </div>
                <div className="text-sm text-slate-500">Uitploeg</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-medium text-slate-800">Scheidsrechter</div>
                <div className="text-slate-600">{selectedGame.referee}</div>
              </div>
              <div>
                <div className="font-medium text-slate-800">Competitie</div>
                <div className="text-slate-600">{league.name}</div>
              </div>
              <div>
                <div className="font-medium text-slate-800">Speelduur</div>
                <div className="text-slate-600">{league.durationMinutes} minuten</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleStartGame}
            disabled={!selectedGameId}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Start wedstrijd
          </button>
        </div>
      </div>
    </div>
  );
}

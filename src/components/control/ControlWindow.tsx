import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useGameTimer } from '../../hooks/useGameTimer';
import { useBuzzer } from '../../hooks/useBuzzer';
import { setupSyncListener } from '../../store/syncListener';
import { ConfigWindow } from '../config/ConfigWindow';
import { ClockDisplay } from './ClockDisplay';
import { ScorePanel } from './ScorePanel';
import { RestMinutePanel } from './RestMinutePanel';
import { EndGamePanel } from './EndGamePanel';
import { InitiatorPopup } from './InitiatorPopup';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { phaseLabel } from '../../utils/gamePhaseLabel';

export default function ControlWindow() {
  const phase = useGameStore((s) => s.phase);
  const league = useGameStore((s) => s.config?.league);
  const openSinglePresentationWindow = useGameStore((s) => s.openSinglePresentationWindow);
  const presentationTheme = useGameStore((s) => s.presentationTheme);
  const togglePresentationTheme = useGameStore((s) => s.togglePresentationTheme);
  const { playBuzzer } = useBuzzer();
  const restMinute = useGameStore((s) => s.restMinute);
  const assignRestMinute = useGameStore((s) => s.assignRestMinute);
  const cancelRestMinute = useGameStore((s) => s.cancelRestMinute);
  const restMinutesUsedA = useGameStore((s) => s.restMinutesUsedA);
  const restMinutesUsedB = useGameStore((s) => s.restMinutesUsedB);
  const config = useGameStore((s) => s.config);
  const resetCurrentHalf = useGameStore((s) => s.resetCurrentHalf);
  useGameTimer();

  const half = phase === 'FIRST_HALF' || phase === 'SECOND_HALF' ? phase : 'FIRST_HALF';
  const aUsedThisHalf = restMinutesUsedA[half];
  const bUsedThisHalf = restMinutesUsedB[half];
  const showPopup = restMinute !== null && restMinute.initiatorTeam === null;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [showPenaltyConfirm, setShowPenaltyConfirm] = useState(false);
  const [penaltyTeam, setPenaltyTeam] = useState<'A' | 'B' | null>(null);
  const abandonGame = useGameStore((s) => s.abandonGame);

  const handleShowPenaltyConfirm = (team: 'A' | 'B') => {
    setPenaltyTeam(team);
    setShowPenaltyConfirm(true);
  };

  const confirmPenalty = () => {
    if (penaltyTeam) {
      const addTeamPenalty = useGameStore.getState().addTeamPenalty;
      addTeamPenalty(penaltyTeam);
      playBuzzer(); // Ring bell for 3rd penalty
      
      // Update the ScorePanel's thirdPenaltyConfirmed state
      // This is a bit of a hack, but we need to communicate back to the ScorePanel
      const scorePanelElements = document.querySelectorAll(`[data-team="${penaltyTeam}"]`);
      scorePanelElements.forEach(el => {
        (el as any).dispatchEvent(new CustomEvent('resetPenalties'));
      });
    }
    setShowPenaltyConfirm(false);
    setPenaltyTeam(null);
  };

  useEffect(() => {
    setupSyncListener().catch(console.error);
  }, []);

  if (phase === 'SETUP') {
    return <ConfigWindow />;
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <div className="w-full h-full flex flex-col">
        
        {/* Top Navigation Bar */}
        <nav className="bg-white/80 backdrop-blur-sm shadow-xl border-b border-white/20" style={{ height: 'clamp(60px, 8vh, 80px)' }}>
          <div className="h-full flex items-center justify-between px-6">
            {/* League and Phase */}
            <div className="flex items-center gap-6">
              {league && (
                <div className="font-bold text-slate-700 uppercase tracking-wider" style={{ fontSize: 'clamp(0.875rem, 1.8vw, 1.25rem)' }}>
                  {league}
                </div>
              )}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-md" style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}>
                {phaseLabel(phase)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={playBuzzer}
                title="Bel rinkelen"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-semibold shadow-md transition-colors duration-200"
                style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)' }}
              >
                <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}>🔔</span>
                Bel
              </button>
              <button
                type="button"
                onClick={() => togglePresentationTheme()}
                title={presentationTheme === 'light' ? 'Schakel naar donker thema' : 'Schakel naar licht thema'}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-lg font-semibold shadow-md transition-colors duration-200"
                style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)' }}
              >
                <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}>{presentationTheme === 'light' ? '☀️' : '🌙'}</span>
                Thema
              </button>
              <button
                type="button"
                onClick={() => openSinglePresentationWindow()}
                title="Presentatiescherm openen"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors duration-200"
                style={{ fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)' }}
              >
                <span style={{ fontSize: 'clamp(1rem, 1.6vw, 1.2rem)' }}>🖥️</span>
                Scherm
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content Grid */}
        <main className="flex-1 p-6 overflow-auto" style={{ paddingTop: 'clamp(1rem, 2vh, 2rem)' }}>
          <div className="h-full grid grid-rows-[auto_1fr] gap-6" style={{ gap: 'clamp(1rem, 2vh, 2rem)' }}>
            
            {/* End Game Panel - shows when game ends */}
            <EndGamePanel />
            
            {/* Score and Clock Section */}
            <div className="flex-1 overflow-visible">
              {/* Desktop Layout - 3 columns */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-4 h-full" style={{ gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
                
                {/* Team A Panel */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <ScorePanel team="A" onShowPenaltyConfirm={() => handleShowPenaltyConfirm('A')} />
                </div>

                {/* Center Clock */}
                <div className="flex flex-col items-center justify-center" style={{ gap: 'clamp(1rem, 2vh, 2rem)' }}>
                  <ClockDisplay 
                    onResetClick={() => setShowResetConfirm(true)} 
                    onQuitClick={() => setShowQuitConfirm(true)} 
                  />
                  <RestMinutePanel />
                </div>

                {/* Team B Panel */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <ScorePanel team="B" onShowPenaltyConfirm={() => handleShowPenaltyConfirm('B')} />
                </div>

              </div>

              {/* Mobile Layout - 2x2 grid */}
              <div className="lg:hidden grid grid-cols-2 grid-rows-2 gap-4 h-full" style={{ gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
                
                {/* Top-left: Home Team Score */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <ScorePanel team="A" onShowPenaltyConfirm={() => handleShowPenaltyConfirm('A')} />
                </div>

                {/* Top-right: Away Team Score */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <ScorePanel team="B" onShowPenaltyConfirm={() => handleShowPenaltyConfirm('B')} />
                </div>

                {/* Bottom-left: Stop Match */}
                <div className="flex flex-col items-center justify-center">
                  <ClockDisplay 
                    onResetClick={() => setShowResetConfirm(true)} 
                    onQuitClick={() => setShowQuitConfirm(true)} 
                  />
                </div>

                {/* Bottom-right: Rest Minutes */}
                <div className="flex flex-col items-center justify-center">
                  <RestMinutePanel />
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    
    {/* Global Popups - rendered outside container constraints */}
    {showPopup && (
      <InitiatorPopup
        teamAName={config?.teamA.name ?? 'Team A'}
        teamBName={config?.teamB.name ?? 'Team B'}
        refereeName={config?.referee ?? 'Scheidsrechter'}
        onSelect={assignRestMinute}
        onCancel={cancelRestMinute}
        disabledA={aUsedThisHalf >= 2}
        disabledB={bUsedThisHalf >= 2}
      />
    )}

    {/* Reset Confirmation Dialog */}
    {showResetConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Helft resetten?</h3>
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Weet je zeker dat je de huidige helft wilt resetten? De tijd wordt teruggezet naar 0:00 en de klok wordt gestopt.
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Annuleren
            </button>
            <button
              type="button"
              onClick={() => {
                resetCurrentHalf();
                setShowResetConfirm(false);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
            >
              Ja, resetten
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Quit Confirmation Dialog */}
    {showQuitConfirm && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 border border-slate-200/50 max-h-screen overflow-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Wedstrijd stoppen?</h2>
            <p className="text-slate-600 mb-6">De wedstrijd wordt gestopt en je keert terug naar het configuratiescherm.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuitConfirm(false);
                  abandonGame();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Ja, stoppen
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Penalty Confirmation Dialog */}
    {showPenaltyConfirm && (
      <ConfirmationDialog
        isOpen={showPenaltyConfirm}
        title="Derde straf?"
        message={`Weet je zeker dat je de derde straf wilt toekennen aan ${penaltyTeam === 'A' ? config?.teamA.name : config?.teamB.name}? Dit zal een belsignaal activeren.`}
        onConfirm={confirmPenalty}
        onCancel={() => setShowPenaltyConfirm(false)}
        confirmText="Ja, straf toekennen"
        cancelText="Annuleren"
      />
    )}

      </div>
  );
}

import type { RestMinuteInitiator } from '../../types/game';

interface InitiatorPopupProps {
  onSelect: (initiator: RestMinuteInitiator) => void;
  onCancel: () => void;
  teamAName: string;
  teamBName: string;
  refereeName: string;
  disabledA?: boolean;
  disabledB?: boolean;
}

export function InitiatorPopup({ onSelect, onCancel, teamAName, teamBName, refereeName, disabledA, disabledB }: InitiatorPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-8 w-full max-w-2xl max-h-screen overflow-auto">
          <div className="text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Wie neemt de rustminuut?
              </h2>
              <p className="text-slate-600">
                De timer is gestart. Wijs de aanvrager toe of annuleer.
              </p>
            </div>

            {/* Team Buttons */}
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => onSelect('A')}
                  disabled={disabledA}
                  title={disabledA ? 'Maximum rustminuten bereikt deze helft' : undefined}
                  className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                >
                  {teamAName}
                  {disabledA && (
                    <div className="text-sm font-normal mt-1 opacity-75">
                      max bereikt
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onSelect('B')}
                  disabled={disabledB}
                  title={disabledB ? 'Maximum rustminuten bereikt deze helft' : undefined}
                  className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
                >
                  {teamBName}
                  {disabledB && (
                    <div className="text-sm font-normal mt-1 opacity-75">
                      max bereikt
                    </div>
                  )}
                </button>
              </div>

              {/* Referee Button */}
              <button
                type="button"
                onClick={() => onSelect('referee')}
                className="w-full px-6 py-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-bold transition-colors duration-200 shadow-lg"
                style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
              >
                {refereeName} (Scheidsrechter)
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-red-600 font-semibold hover:text-red-700 transition-colors duration-200"
              style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1rem)' }}
            >
              Rustminuut annuleren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

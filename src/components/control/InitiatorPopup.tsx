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
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
    >
      <div
        style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '2rem', minWidth: '320px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', color: '#1e293b' }}
      >
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>
          Wie neemt de rustminuut?
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          De timer is gestart. Wijs de aanvrager toe of annuleer.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => onSelect('A')}
              disabled={disabledA}
              title={disabledA ? 'Maximum rustminuten bereikt deze helft' : undefined}
              style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: disabledA ? '#93c5fd' : '#2563eb', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: disabledA ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: disabledA ? 0.5 : 1 }}
            >
              {teamAName}
              {disabledA && <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: '2px' }}>max bereikt</div>}
            </button>
            <button
              type="button"
              onClick={() => onSelect('B')}
              disabled={disabledB}
              title={disabledB ? 'Maximum rustminuten bereikt deze helft' : undefined}
              style={{ flex: 1, padding: '0.75rem 1rem', backgroundColor: disabledB ? '#fca5a5' : '#dc2626', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: disabledB ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: disabledB ? 0.5 : 1 }}
            >
              {teamBName}
              {disabledB && <div style={{ fontSize: '0.65rem', fontWeight: 400, marginTop: '2px' }}>max bereikt</div>}
            </button>
          </div>
          <button
            type="button"
            onClick={() => onSelect('referee')}
            style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: '#475569', color: '#fff', fontWeight: 700, borderRadius: '0.75rem', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
          >
            {refereeName} (Scheidsrechter)
          </button>
        </div>

        <button
          type="button"
          onClick={onCancel}
          style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Rustminuut annuleren
        </button>
      </div>
    </div>
  );
}

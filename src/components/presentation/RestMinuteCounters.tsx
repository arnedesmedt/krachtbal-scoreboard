import type { GameStateUpdatePayload } from '../../types/game';

interface RestMinuteCountersProps {
  payload: GameStateUpdatePayload;
}

export function RestMinuteCounters({ payload }: RestMinuteCountersProps) {
  const half = payload.phase === 'FIRST_HALF' || payload.phase === 'SECOND_HALF' ? payload.phase : 'FIRST_HALF';
  const aThisHalf = payload.restMinutesUsedA[half];
  const bThisHalf = payload.restMinutesUsedB[half];
  const refThisHalf = payload.restMinutesUsedReferee[half];
  const aTotal = payload.restMinutesUsedA.FIRST_HALF + payload.restMinutesUsedA.SECOND_HALF;
  const bTotal = payload.restMinutesUsedB.FIRST_HALF + payload.restMinutesUsedB.SECOND_HALF;
  const refTotal = payload.restMinutesUsedReferee.FIRST_HALF + payload.restMinutesUsedReferee.SECOND_HALF;

  return (
    <div className="bg-gray-900 rounded-2xl flex justify-center items-center" style={{ padding: '1.5vh 4vw', gap: '6vw' }}>
      <div className="text-center">
        <div className="font-bold mb-[0.5vh]" style={{ color: payload.teamA.color, fontSize: '1.8vw' }}>{payload.teamA.name}</div>
        <div className="font-black text-white" style={{ fontSize: '5vw' }}>
          {aThisHalf}<span className="text-gray-500" style={{ fontSize: '2.5vw' }}>/2</span>
        </div>
        <div className="text-gray-500 uppercase tracking-wide" style={{ fontSize: '1.1vw' }}>deze helft · totaal: {aTotal}</div>
      </div>
      <div className="text-gray-700 font-thin" style={{ fontSize: '3vw' }}>|</div>
      <div className="text-center">
        <div className="font-bold text-gray-300 mb-[0.5vh]" style={{ fontSize: '1.8vw' }}>{payload.referee || 'Scheidsrechter'}</div>
        <div className="font-black text-white" style={{ fontSize: '5vw' }}>{refThisHalf}</div>
        <div className="text-gray-500 uppercase tracking-wide" style={{ fontSize: '1.1vw' }}>deze helft · totaal: {refTotal}</div>
      </div>
      <div className="text-gray-700 font-thin" style={{ fontSize: '3vw' }}>|</div>
      <div className="text-center">
        <div className="font-bold mb-[0.5vh]" style={{ color: payload.teamB.color, fontSize: '1.8vw' }}>{payload.teamB.name}</div>
        <div className="font-black text-white" style={{ fontSize: '5vw' }}>
          {bThisHalf}<span className="text-gray-500" style={{ fontSize: '2.5vw' }}>/2</span>
        </div>
        <div className="text-gray-500 uppercase tracking-wide" style={{ fontSize: '1.1vw' }}>deze helft · totaal: {bTotal}</div>
      </div>
    </div>
  );
}

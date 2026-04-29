import type { GameStateUpdatePayload } from '../../types/game';

interface RestMinuteCountersProps {
  payload: GameStateUpdatePayload;
  theme?: 'light' | 'dark';
}

export function RestMinuteCounters({ payload, theme = 'light' }: RestMinuteCountersProps) {
  const half: 'FIRST_HALF' | 'SECOND_HALF' | 'THIRD_HALF' | 'FOURTH_HALF' = 
    payload.phase === 'FIRST_HALF' || payload.phase === 'SECOND_HALF' || payload.phase === 'THIRD_HALF' || payload.phase === 'FOURTH_HALF' 
      ? payload.phase 
      : 'FIRST_HALF';
  const aThisHalf = payload.restMinutesUsedA[half];
  const bThisHalf = payload.restMinutesUsedB[half];
  const refThisHalf = payload.restMinutesUsedReferee[half];
  const aTotal = payload.restMinutesUsedA.FIRST_HALF + payload.restMinutesUsedA.SECOND_HALF + payload.restMinutesUsedA.THIRD_HALF + payload.restMinutesUsedA.FOURTH_HALF;
  const bTotal = payload.restMinutesUsedB.FIRST_HALF + payload.restMinutesUsedB.SECOND_HALF + payload.restMinutesUsedB.THIRD_HALF + payload.restMinutesUsedB.FOURTH_HALF;
  const refTotal = payload.restMinutesUsedReferee.FIRST_HALF + payload.restMinutesUsedReferee.SECOND_HALF + payload.restMinutesUsedReferee.THIRD_HALF + payload.restMinutesUsedReferee.FOURTH_HALF;

  return (
    <div
      className={`rounded-2xl flex justify-center items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
      style={{ padding: '1.5vh 4vw', gap: '6vw' }}
    >
      <div className="text-center">
        <div className="font-bold mb-[0.5vh]" style={{ color: payload.teamA.color, fontSize: '1.8vw' }}>{payload.teamA.name}</div>
        <div className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '5vw' }}>
          {aThisHalf}<span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} style={{ fontSize: '2.5vw' }}>/2</span>
        </div>
        <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wide`} style={{ fontSize: '1.1vw' }}>deze helft  totaal: {aTotal}</div>
      </div>
      <div className={`font-thin ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} style={{ fontSize: '3vw' }}>|</div>
      <div className="text-center">
        <div className={`font-bold mb-[0.5vh] ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ fontSize: '1.8vw' }}>{payload.referee || 'Scheidsrechter'}</div>
        <div className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '5vw' }}>{refThisHalf}</div>
        <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wide`} style={{ fontSize: '1.1vw' }}>deze helft  totaal: {refTotal}</div>
      </div>
      <div className={`font-thin ${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'}`} style={{ fontSize: '3vw' }}>|</div>
      <div className="text-center">
        <div className="font-bold mb-[0.5vh]" style={{ color: payload.teamB.color, fontSize: '1.8vw' }}>{payload.teamB.name}</div>
        <div className={`font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: '5vw' }}>
          {bThisHalf}<span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} style={{ fontSize: '2.5vw' }}>/2</span>
        </div>
        <div className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wide`} style={{ fontSize: '1.1vw' }}>deze helft  totaal: {bTotal}</div>
      </div>
    </div>
  );
}

import { setBuzzerFn } from '../store/gameStore';

let buzzerInitialized = false;

/**
 * useBuzzer — plays bell.mp3 from the public/resources folder and registers it with the store.
 */
export function useBuzzer() {
  function playBuzzer() {
    const audio = new Audio('/bell.mp3');
    audio.play().catch(console.error);
  }

  if (!buzzerInitialized) {
    setBuzzerFn(playBuzzer);
    buzzerInitialized = true;
  }

  return { playBuzzer };
}

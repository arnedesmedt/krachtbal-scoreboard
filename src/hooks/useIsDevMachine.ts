import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const DEBUG_MAC = import.meta.env.VITE_DEBUG_MAC as string | undefined;

export function useIsDevMachine(): boolean {
  const [isDevMachine, setIsDevMachine] = useState(false);

  useEffect(() => {
    if (!DEBUG_MAC) return;
    invoke<string>('get_mac_address')
      .then((mac) => setIsDevMachine(mac === DEBUG_MAC))
      .catch(() => {});
  }, []);

  return isDevMachine;
}

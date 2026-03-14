import { useMemo } from 'react';
import { isTauri, isBrowser } from '@/lib/platform.ts';

export function usePlatform() {
  return useMemo(() => ({
    isTauri: isTauri(),
    isBrowser: isBrowser(),
  }), []);
}

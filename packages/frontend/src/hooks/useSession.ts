import { useCallback } from 'react';

export function useSession(onReset: () => void) {
  const resetSession = useCallback(async () => {
    try {
      await fetch('/api/session/reset', { method: 'POST' });
      onReset();
    } catch (err) {
      console.error('Failed to reset session:', err);
    }
  }, [onReset]);

  return { resetSession };
}

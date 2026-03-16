import { useState, useCallback, useEffect } from 'react';

export interface DoltCommit {
  commit_hash: string;
  committer: string;
  email: string;
  date: string;
  message: string;
}

export function useHistory() {
  const [commits, setCommits] = useState<DoltCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history?limit=50');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCommits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, []);

  const rewindTo = useCallback(async (commitHash: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/history/rewind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitHash, confirm: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchHistory();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rewind');
      return false;
    }
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { commits, loading, error, fetchHistory, rewindTo };
}

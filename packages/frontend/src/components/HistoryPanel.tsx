import { useState } from 'react';
import type { DoltCommit } from '../hooks/useHistory';

interface HistoryPanelProps {
  commits: DoltCommit[];
  loading: boolean;
  error: string | null;
  onRewind: (commitHash: string) => Promise<boolean>;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatMessage(message: string): string {
  // Clean up auto-generated Dolt commit messages
  if (message.startsWith('Transaction commit')) return 'Data updated';
  return message.length > 60 ? message.slice(0, 57) + '...' : message;
}

export function HistoryPanel({ commits, loading, error, onRewind, onRefresh }: HistoryPanelProps) {
  const [rewindingHash, setRewindingHash] = useState<string | null>(null);
  const [confirmHash, setConfirmHash] = useState<string | null>(null);

  const handleRewind = async (hash: string) => {
    if (confirmHash !== hash) {
      setConfirmHash(hash);
      return;
    }

    setRewindingHash(hash);
    setConfirmHash(null);
    await onRewind(hash);
    setRewindingHash(null);
  };

  if (error) {
    return (
      <div className="p-3">
        <div className="text-xs text-red-500 bg-red-50 rounded p-2">
          {error}
        </div>
        <button
          onClick={onRefresh}
          className="mt-2 text-xs text-pm-600 hover:text-pm-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && commits.length === 0) {
    return (
      <div className="p-3 text-xs text-gray-400 text-center">
        Loading history...
      </div>
    );
  }

  if (commits.length === 0) {
    return (
      <div className="p-3 text-xs text-gray-400 text-center">
        No history yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-3 pt-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          History
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh history"
        >
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-col">
        {commits.map((commit, idx) => (
          <div
            key={commit.commit_hash}
            className="group px-3 py-2 hover:bg-gray-50 border-l-2 border-transparent hover:border-pm-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-700 truncate" title={commit.message}>
                  {formatMessage(commit.message)}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatDate(commit.date)}
                  <span className="ml-1 font-mono">{commit.commit_hash.slice(0, 7)}</span>
                </p>
              </div>

              {idx > 0 && (
                <button
                  onClick={() => handleRewind(commit.commit_hash)}
                  disabled={rewindingHash !== null}
                  className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded transition-colors
                    ${confirmHash === commit.commit_hash
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 visible'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 invisible group-hover:visible'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={confirmHash === commit.commit_hash ? 'Click again to confirm rewind' : 'Rewind to this point'}
                >
                  {rewindingHash === commit.commit_hash
                    ? '...'
                    : confirmHash === commit.commit_hash
                      ? 'Confirm?'
                      : 'Rewind'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

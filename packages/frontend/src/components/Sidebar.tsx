import { useState } from 'react';
import { QuickActions } from './QuickActions';
import { HistoryPanel } from './HistoryPanel';
import type { DoltCommit } from '../hooks/useHistory';

interface SidebarProps {
  onQuickAction: (prompt: string) => void;
  onNewChat: () => void;
  isStreaming: boolean;
  historyCommits: DoltCommit[];
  historyLoading: boolean;
  historyError: string | null;
  onRewind: (commitHash: string) => Promise<boolean>;
  onRefreshHistory: () => void;
}

type Tab = 'actions' | 'history';

export function Sidebar({
  onQuickAction, onNewChat, isStreaming,
  historyCommits, historyLoading, historyError, onRewind, onRefreshHistory,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('actions');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-pm-700">PM-Box</h1>
        <p className="text-xs text-gray-500 mt-0.5">Project Management Assistant</p>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          disabled={isStreaming}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium
            text-gray-700 hover:bg-gray-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + New Conversation
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 px-3">
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 text-xs py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'actions'
              ? 'border-pm-500 text-pm-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Quick Actions
        </button>
        <button
          onClick={() => { setActiveTab('history'); onRefreshHistory(); }}
          className={`flex-1 text-xs py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-pm-500 text-pm-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'actions' ? (
          <div className="p-3">
            <QuickActions onAction={onQuickAction} disabled={isStreaming} />
          </div>
        ) : (
          <HistoryPanel
            commits={historyCommits}
            loading={historyLoading}
            error={historyError}
            onRewind={onRewind}
            onRefresh={onRefreshHistory}
          />
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Powered by Claude Code + Dolt
        </p>
      </div>
    </aside>
  );
}

import { QuickActions } from './QuickActions';

interface SidebarProps {
  onQuickAction: (prompt: string) => void;
  onNewChat: () => void;
  isStreaming: boolean;
}

export function Sidebar({ onQuickAction, onNewChat, isStreaming }: SidebarProps) {
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

      {/* Quick Actions */}
      <div className="flex-1 overflow-y-auto p-3">
        <QuickActions onAction={onQuickAction} disabled={isStreaming} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Powered by Claude Code
        </p>
      </div>
    </aside>
  );
}

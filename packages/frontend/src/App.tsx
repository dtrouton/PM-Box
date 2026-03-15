import { useChat } from './hooks/useChat';
import { useSession } from './hooks/useSession';
import { useHistory } from './hooks/useHistory';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { StatusIndicator } from './components/StatusIndicator';

export default function App() {
  const { messages, isStreaming, error, sendMessage, stopStreaming, clearMessages } = useChat();
  const { resetSession } = useSession(clearMessages);
  const { commits, loading: historyLoading, error: historyError, fetchHistory, rewindTo } = useHistory();

  const handleNewChat = async () => {
    await resetSession();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onQuickAction={sendMessage}
        onNewChat={handleNewChat}
        isStreaming={isStreaming}
        historyCommits={commits}
        historyLoading={historyLoading}
        historyError={historyError}
        onRewind={rewindTo}
        onRefreshHistory={fetchHistory}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <StatusIndicator isStreaming={isStreaming} error={error} />
        <ChatWindow messages={messages} isStreaming={isStreaming} />
        <InputBar
          onSend={sendMessage}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </main>
    </div>
  );
}

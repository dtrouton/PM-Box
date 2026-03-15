import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
}

export function ChatWindow({ messages, isStreaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome to PM-Box
          </h2>
          <p className="text-gray-500 mb-6">
            Your AI project management assistant. Ask me about your projects,
            todos, stakeholders, or use the quick actions to get started.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              Track tasks & todos
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              Manage stakeholders
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              Project status reports
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              Sprint planning
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

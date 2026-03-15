import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-pm-600 text-white rounded-br-md'
            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="message-content prose prose-sm max-w-none">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

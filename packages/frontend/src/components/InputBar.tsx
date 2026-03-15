import { useState, useRef, useEffect } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function InputBar({ onSend, isStreaming, onStop }: InputBarProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = () => {
    if (input.trim() && !isStreaming) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask your PM assistant..."
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-pm-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            placeholder:text-gray-400"
        />
        {isStreaming ? (
          <button
            onClick={onStop}
            className="rounded-xl bg-red-500 px-4 py-3 text-white text-sm font-medium
              hover:bg-red-600 transition-colors shrink-0"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="rounded-xl bg-pm-600 px-4 py-3 text-white text-sm font-medium
              hover:bg-pm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}

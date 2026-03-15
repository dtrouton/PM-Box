interface StatusIndicatorProps {
  isStreaming: boolean;
  error: string | null;
}

export function StatusIndicator({ isStreaming, error }: StatusIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 text-sm">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (isStreaming) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-pm-50 text-pm-700 text-sm">
        <span className="w-2 h-2 rounded-full bg-pm-500 animate-pulse" />
        <span>Thinking...</span>
      </div>
    );
  }

  return null;
}

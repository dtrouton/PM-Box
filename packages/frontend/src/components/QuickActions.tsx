import type { QuickAction } from '../types';

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Show my todos',
    prompt: 'Show me the current active tasks and their status from the todo list.',
    icon: 'check',
  },
  {
    label: 'Project status',
    prompt: 'Give me a summary of the current project status including key milestones and any blockers.',
    icon: 'chart',
  },
  {
    label: 'Stakeholders',
    prompt: 'Show me the stakeholder directory with their roles and contact information.',
    icon: 'people',
  },
  {
    label: 'Create Jira ticket',
    prompt: 'Help me create a new Jira ticket. Ask me for the details like summary, description, priority, and assignee.',
    icon: 'ticket',
  },
  {
    label: 'Check bugs',
    prompt: 'Show me the current bug tracker status - open bugs, their severity, and who is working on them.',
    icon: 'bug',
  },
  {
    label: 'Sprint planning',
    prompt: 'Help me plan the next sprint. Show me the backlog and help me prioritize tasks.',
    icon: 'plan',
  },
];

const ICONS: Record<string, string> = {
  check: '\u2713',
  chart: '\u25A0',
  people: '\u263A',
  ticket: '\u2606',
  bug: '\u26A0',
  plan: '\u25B6',
};

interface QuickActionsProps {
  onAction: (prompt: string) => void;
  disabled: boolean;
}

export function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 mb-2">
        Quick Actions
      </p>
      {QUICK_ACTIONS.map(action => (
        <button
          key={action.label}
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700
            hover:bg-pm-50 hover:text-pm-700 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2"
        >
          <span className="text-pm-500 w-5 text-center">{ICONS[action.icon]}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

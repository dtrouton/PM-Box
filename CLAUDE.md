# PM-Box

## Project Overview
PM-Box is a web frontend for Claude Code that provides project management capabilities to non-technical users. It connects a React chat interface to Claude Code running as a backend via the Claude Agent SDK.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (`packages/frontend/`)
- **Backend**: Express.js + Claude Agent SDK (`packages/backend/`)
- **PM Context**: Markdown files in `pm-data/` serve as the working knowledge base

## Development
```bash
npm install                    # Install all workspace dependencies
npm run dev:backend            # Start backend on port 3001
npm run dev:frontend           # Start frontend on port 5173 (proxies /api to backend)
```

## Key Files
- `packages/backend/src/claude/system-prompt.ts` - PM-focused system prompt
- `packages/backend/src/claude/client.ts` - Claude Agent SDK wrapper
- `packages/frontend/src/components/` - React UI components
- `pm-data/` - Project context files (todos, stakeholders, docs, etc.)
- `.claude/settings.json` - MCP server configuration

## MCP Integrations
- **Memory**: Persistent knowledge graph for stakeholder/project context
- **Filesystem**: Access to pm-data/ directory
- **Atlassian**: Jira + Confluence (requires OAuth setup)
- **Google Workspace**: Drive, Gmail, Calendar (requires OAuth setup)
- **Slack**: Messaging (requires bot token)

## Guidelines
- Keep responses non-technical and structured
- Use pm-data/ files as the source of truth for project info
- Update markdown files when users modify todos, stakeholders, etc.

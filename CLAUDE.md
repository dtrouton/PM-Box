# PM-Box

## Project Overview
PM-Box is a web frontend for Claude Code that provides project management capabilities to non-technical users. It connects a React chat interface to Claude Code running as a backend via the Claude Agent SDK.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (`packages/frontend/`)
- **Backend**: Express.js + Claude Agent SDK (`packages/backend/`)
- **Database**: Dolt (git-versioned SQL database) — every change is committed, enabling full rewind
- **SDK Tools**: Custom MCP tools defined via `createSdkMcpServer()` for Claude to read/write the Dolt database

## Development
```bash
# 1. Install dependencies
npm install

# 2. Start Dolt SQL server (requires dolt installed)
./scripts/start-dolt.sh

# 3. Start backend (connects to Dolt, initializes schema, seeds data)
npm run dev:backend          # Port 3001

# 4. Start frontend
npm run dev:frontend         # Port 5173 (proxies /api to backend)
```

### Dolt Installation
```bash
# macOS
brew install dolt

# Linux
sudo bash -c 'curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | bash'
```

## Key Files
- `packages/backend/src/claude/tools.ts` - SDK MCP tools for database CRUD operations
- `packages/backend/src/claude/system-prompt.ts` - PM-focused system prompt
- `packages/backend/src/claude/client.ts` - Claude Agent SDK wrapper with MCP server
- `packages/backend/src/database/` - Dolt connection, schema, history, and seeding
- `packages/frontend/src/components/` - React UI components
- `packages/frontend/src/components/HistoryPanel.tsx` - Version history timeline
- `.claude/settings.json` - MCP server configuration (external integrations)
- `scripts/start-dolt.sh` - Dolt SQL server startup script

## Database Schema
All PM data lives in Dolt tables: `projects`, `tasks`, `stakeholders`, `bugs`, `roadmap_items`, `documents`. Every write auto-commits to Dolt's version history, enabling:
- Full audit trail via `dolt_log`
- Diff between any two points via `dolt_diff`
- Rewind to any previous state via `DOLT_RESET`

## MCP Integrations
- **pmbox-database**: In-process SDK MCP server (defined in tools.ts) — primary data access
- **Memory**: Persistent knowledge graph for stakeholder/project context
- **Atlassian**: Jira + Confluence (requires OAuth setup)
- **Google Workspace**: Drive, Gmail, Calendar (requires OAuth setup)
- **Slack**: Messaging (requires bot token)

## Guidelines
- Keep responses non-technical and structured
- All PM data is stored in the Dolt database (not markdown files)
- Use the pmbox-database MCP tools for all data operations
- Every data change creates a Dolt commit for full rewindability

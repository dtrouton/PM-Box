import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { execute, run } from '../database/connection.js';
import { getCommitLog, rewindTo, getCommitDiffSummary, getTableDiff } from '../database/history.js';

// ── Task Tools ──────────────────────────────────────────────────────────────

const listTasks = tool(
  'list_tasks',
  'List tasks with optional filters. Returns all tasks or filtered by status, assignee, priority, or project.',
  {
    status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional().describe('Filter by task status'),
    assignee: z.string().optional().describe('Filter by assignee name'),
    priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Filter by priority'),
    project_id: z.string().optional().describe('Filter by project ID'),
  },
  async (args) => {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (args.status) { conditions.push('t.status = ?'); params.push(args.status); }
    if (args.assignee) { conditions.push('t.assignee LIKE ?'); params.push(`%${args.assignee}%`); }
    if (args.priority) { conditions.push('t.priority = ?'); params.push(args.priority); }
    if (args.project_id) { conditions.push('t.project_id = ?'); params.push(args.project_id); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await execute(
      `SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id ${where} ORDER BY FIELD(t.priority, 'critical', 'high', 'medium', 'low'), t.due_date`,
      params,
    );

    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createTask = tool(
  'create_task',
  'Create a new task. Returns the created task with its ID.',
  {
    title: z.string().describe('Task title'),
    description: z.string().optional().describe('Task description'),
    status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional().describe('Task status (default: todo)'),
    priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Priority level (default: medium)'),
    assignee: z.string().optional().describe('Person assigned to this task'),
    project_id: z.string().optional().describe('Project ID this task belongs to'),
    due_date: z.string().optional().describe('Due date in YYYY-MM-DD format'),
    jira_ticket_id: z.string().optional().describe('Associated Jira ticket ID'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO tasks (id, title, description, status, priority, assignee, project_id, due_date, jira_ticket_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, args.title, args.description ?? null, args.status ?? 'todo', args.priority ?? 'medium',
       args.assignee ?? null, args.project_id ?? null, args.due_date ?? null, args.jira_ticket_id ?? null],
    );
    const rows = await execute('SELECT * FROM tasks WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Task created:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const updateTask = tool(
  'update_task',
  'Update an existing task by ID. Only the provided fields will be changed.',
  {
    id: z.string().describe('Task ID to update'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional().describe('New status'),
    priority: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('New priority'),
    assignee: z.string().optional().describe('New assignee'),
    due_date: z.string().optional().describe('New due date (YYYY-MM-DD)'),
    jira_ticket_id: z.string().optional().describe('New Jira ticket ID'),
  },
  async (args) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    const { id, ...fields } = args;

    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) {
        sets.push(`${key} = ?`);
        params.push(val);
      }
    }

    if (sets.length === 0) {
      return { content: [{ type: 'text' as const, text: 'No fields to update.' }] };
    }

    params.push(id);
    await run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await execute('SELECT * FROM tasks WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Task updated:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const deleteTask = tool(
  'delete_task',
  'Delete a task by ID.',
  { id: z.string().describe('Task ID to delete') },
  async (args) => {
    const rows = await execute('SELECT title FROM tasks WHERE id = ?', [args.id]);
    if (rows.length === 0) {
      return { content: [{ type: 'text' as const, text: 'Task not found.' }] };
    }
    await run('DELETE FROM tasks WHERE id = ?', [args.id]);
    return { content: [{ type: 'text' as const, text: `Deleted task: ${(rows[0] as { title: string }).title}` }] };
  },
);

// ── Stakeholder Tools ───────────────────────────────────────────────────────

const listStakeholders = tool(
  'list_stakeholders',
  'List all stakeholders, optionally filtered by department or role.',
  {
    department: z.string().optional().describe('Filter by department'),
    role: z.string().optional().describe('Filter by role (partial match)'),
  },
  async (args) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (args.department) { conditions.push('department = ?'); params.push(args.department); }
    if (args.role) { conditions.push('role LIKE ?'); params.push(`%${args.role}%`); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await execute(`SELECT * FROM stakeholders ${where} ORDER BY name`, params);
    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createStakeholder = tool(
  'create_stakeholder',
  'Add a new stakeholder to the database.',
  {
    name: z.string().describe('Stakeholder name'),
    role: z.string().optional().describe('Role or title'),
    department: z.string().optional().describe('Department'),
    email: z.string().optional().describe('Email address'),
    slack_handle: z.string().optional().describe('Slack handle'),
    communication_preference: z.string().optional().describe('Communication preference'),
    notes: z.string().optional().describe('Additional notes'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO stakeholders (id, name, role, department, email, slack_handle, communication_preference, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, args.name, args.role ?? null, args.department ?? null, args.email ?? null,
       args.slack_handle ?? null, args.communication_preference ?? null, args.notes ?? null],
    );
    const rows = await execute('SELECT * FROM stakeholders WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Stakeholder added:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const updateStakeholder = tool(
  'update_stakeholder',
  'Update a stakeholder by ID.',
  {
    id: z.string().describe('Stakeholder ID'),
    name: z.string().optional().describe('New name'),
    role: z.string().optional().describe('New role'),
    department: z.string().optional().describe('New department'),
    email: z.string().optional().describe('New email'),
    slack_handle: z.string().optional().describe('New Slack handle'),
    communication_preference: z.string().optional().describe('New communication preference'),
    notes: z.string().optional().describe('New notes'),
  },
  async (args) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    const { id, ...fields } = args;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) { sets.push(`${key} = ?`); params.push(val); }
    }
    if (sets.length === 0) return { content: [{ type: 'text' as const, text: 'No fields to update.' }] };
    params.push(id);
    await run(`UPDATE stakeholders SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await execute('SELECT * FROM stakeholders WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Stakeholder updated:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

// ── Project Tools ───────────────────────────────────────────────────────────

const listProjects = tool(
  'list_projects',
  'List all projects, optionally filtered by status.',
  {
    status: z.enum(['planning', 'in_progress', 'on_hold', 'completed']).optional().describe('Filter by status'),
  },
  async (args) => {
    const where = args.status ? 'WHERE status = ?' : '';
    const params = args.status ? [args.status] : [];
    const rows = await execute(`SELECT * FROM projects ${where} ORDER BY name`, params);
    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createProject = tool(
  'create_project',
  'Create a new project.',
  {
    name: z.string().describe('Project name'),
    description: z.string().optional().describe('Project description'),
    status: z.enum(['planning', 'in_progress', 'on_hold', 'completed']).optional().describe('Status (default: planning)'),
    lead: z.string().optional().describe('Project lead'),
    start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
    target_end_date: z.string().optional().describe('Target end date (YYYY-MM-DD)'),
    jira_board_url: z.string().optional().describe('Jira board URL'),
    confluence_url: z.string().optional().describe('Confluence space URL'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO projects (id, name, description, status, lead, start_date, target_end_date, jira_board_url, confluence_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, args.name, args.description ?? null, args.status ?? 'planning', args.lead ?? null,
       args.start_date ?? null, args.target_end_date ?? null, args.jira_board_url ?? null, args.confluence_url ?? null],
    );
    const rows = await execute('SELECT * FROM projects WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Project created:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const updateProject = tool(
  'update_project',
  'Update a project by ID.',
  {
    id: z.string().describe('Project ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z.enum(['planning', 'in_progress', 'on_hold', 'completed']).optional().describe('New status'),
    lead: z.string().optional().describe('New lead'),
    start_date: z.string().optional().describe('New start date'),
    target_end_date: z.string().optional().describe('New target end date'),
    jira_board_url: z.string().optional().describe('New Jira board URL'),
    confluence_url: z.string().optional().describe('New Confluence URL'),
  },
  async (args) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    const { id, ...fields } = args;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) { sets.push(`${key} = ?`); params.push(val); }
    }
    if (sets.length === 0) return { content: [{ type: 'text' as const, text: 'No fields to update.' }] };
    params.push(id);
    await run(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await execute('SELECT * FROM projects WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Project updated:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

// ── Bug Tools ───────────────────────────────────────────────────────────────

const listBugs = tool(
  'list_bugs',
  'List bugs with optional filters.',
  {
    status: z.enum(['open', 'investigating', 'in_progress', 'resolved', 'closed']).optional().describe('Filter by status'),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Filter by severity'),
    project_id: z.string().optional().describe('Filter by project'),
  },
  async (args) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (args.status) { conditions.push('b.status = ?'); params.push(args.status); }
    if (args.severity) { conditions.push('b.severity = ?'); params.push(args.severity); }
    if (args.project_id) { conditions.push('b.project_id = ?'); params.push(args.project_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await execute(
      `SELECT b.*, p.name as project_name FROM bugs b LEFT JOIN projects p ON b.project_id = p.id ${where} ORDER BY FIELD(b.severity, 'critical', 'high', 'medium', 'low')`,
      params,
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createBug = tool(
  'create_bug',
  'Report a new bug.',
  {
    title: z.string().describe('Bug title'),
    description: z.string().optional().describe('Bug description'),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('Severity (default: medium)'),
    status: z.enum(['open', 'investigating', 'in_progress', 'resolved', 'closed']).optional().describe('Status (default: open)'),
    assignee: z.string().optional().describe('Assignee'),
    reporter: z.string().optional().describe('Reporter'),
    project_id: z.string().optional().describe('Project ID'),
    jira_ticket_id: z.string().optional().describe('Jira ticket ID'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO bugs (id, title, description, severity, status, assignee, reporter, project_id, jira_ticket_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, args.title, args.description ?? null, args.severity ?? 'medium', args.status ?? 'open',
       args.assignee ?? null, args.reporter ?? null, args.project_id ?? null, args.jira_ticket_id ?? null],
    );
    const rows = await execute('SELECT * FROM bugs WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Bug reported:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const updateBug = tool(
  'update_bug',
  'Update a bug by ID.',
  {
    id: z.string().describe('Bug ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional().describe('New severity'),
    status: z.enum(['open', 'investigating', 'in_progress', 'resolved', 'closed']).optional().describe('New status'),
    assignee: z.string().optional().describe('New assignee'),
    jira_ticket_id: z.string().optional().describe('New Jira ticket'),
  },
  async (args) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    const { id, ...fields } = args;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) { sets.push(`${key} = ?`); params.push(val); }
    }
    if (sets.length === 0) return { content: [{ type: 'text' as const, text: 'No fields to update.' }] };
    params.push(id);
    await run(`UPDATE bugs SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await execute('SELECT * FROM bugs WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Bug updated:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

// ── Roadmap Tools ───────────────────────────────────────────────────────────

const listRoadmapItems = tool(
  'list_roadmap_items',
  'List roadmap items, optionally filtered by quarter, status, or project.',
  {
    quarter: z.string().optional().describe('Filter by quarter (e.g. "Q2 2026")'),
    status: z.enum(['planned', 'on_track', 'at_risk', 'delayed', 'completed']).optional().describe('Filter by status'),
    project_id: z.string().optional().describe('Filter by project'),
  },
  async (args) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (args.quarter) { conditions.push('r.quarter = ?'); params.push(args.quarter); }
    if (args.status) { conditions.push('r.status = ?'); params.push(args.status); }
    if (args.project_id) { conditions.push('r.project_id = ?'); params.push(args.project_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await execute(
      `SELECT r.*, p.name as project_name FROM roadmap_items r LEFT JOIN projects p ON r.project_id = p.id ${where} ORDER BY r.quarter, r.title`,
      params,
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createRoadmapItem = tool(
  'create_roadmap_item',
  'Add a new item to the roadmap.',
  {
    title: z.string().describe('Roadmap item title'),
    description: z.string().optional().describe('Description'),
    quarter: z.string().optional().describe('Target quarter (e.g. "Q2 2026")'),
    status: z.enum(['planned', 'on_track', 'at_risk', 'delayed', 'completed']).optional().describe('Status (default: planned)'),
    owner: z.string().optional().describe('Owner'),
    project_id: z.string().optional().describe('Project ID'),
    dependencies: z.string().optional().describe('Dependencies (free text)'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO roadmap_items (id, title, description, quarter, status, owner, project_id, dependencies)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, args.title, args.description ?? null, args.quarter ?? null, args.status ?? 'planned',
       args.owner ?? null, args.project_id ?? null, args.dependencies ?? null],
    );
    const rows = await execute('SELECT * FROM roadmap_items WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Roadmap item created:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

const updateRoadmapItem = tool(
  'update_roadmap_item',
  'Update a roadmap item by ID.',
  {
    id: z.string().describe('Roadmap item ID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description'),
    quarter: z.string().optional().describe('New quarter'),
    status: z.enum(['planned', 'on_track', 'at_risk', 'delayed', 'completed']).optional().describe('New status'),
    owner: z.string().optional().describe('New owner'),
    dependencies: z.string().optional().describe('New dependencies'),
  },
  async (args) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    const { id, ...fields } = args;
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) { sets.push(`${key} = ?`); params.push(val); }
    }
    if (sets.length === 0) return { content: [{ type: 'text' as const, text: 'No fields to update.' }] };
    params.push(id);
    await run(`UPDATE roadmap_items SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await execute('SELECT * FROM roadmap_items WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Roadmap item updated:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

// ── Document Tools ──────────────────────────────────────────────────────────

const listDocuments = tool(
  'list_documents',
  'List documents, optionally filtered by type or project.',
  {
    doc_type: z.string().optional().describe('Filter by document type'),
    project_id: z.string().optional().describe('Filter by project'),
  },
  async (args) => {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (args.doc_type) { conditions.push('d.doc_type = ?'); params.push(args.doc_type); }
    if (args.project_id) { conditions.push('d.project_id = ?'); params.push(args.project_id); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await execute(
      `SELECT d.*, p.name as project_name FROM documents d LEFT JOIN projects p ON d.project_id = p.id ${where} ORDER BY d.title`,
      params,
    );
    return { content: [{ type: 'text' as const, text: JSON.stringify(rows, null, 2) }] };
  },
);

const createDocument = tool(
  'create_document',
  'Add a document link to the knowledge base.',
  {
    title: z.string().describe('Document title'),
    doc_type: z.string().optional().describe('Document type (e.g. PRD, Technical, Design)'),
    url: z.string().optional().describe('Document URL'),
    description: z.string().optional().describe('Description'),
    project_id: z.string().optional().describe('Project ID'),
  },
  async (args) => {
    const id = uuidv4();
    await run(
      `INSERT INTO documents (id, title, doc_type, url, description, project_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, args.title, args.doc_type ?? null, args.url ?? null, args.description ?? null, args.project_id ?? null],
    );
    const rows = await execute('SELECT * FROM documents WHERE id = ?', [id]);
    return { content: [{ type: 'text' as const, text: `Document added:\n${JSON.stringify(rows[0], null, 2)}` }] };
  },
);

// ── Search & History Tools ──────────────────────────────────────────────────

const searchAll = tool(
  'search_all',
  'Full-text search across all PM data (tasks, projects, stakeholders, bugs, roadmap items, documents). Returns matching records from any table.',
  {
    query: z.string().describe('Search term to find across all tables'),
  },
  async (args) => {
    const q = `%${args.query}%`;
    const results: Record<string, unknown[]> = {};

    const [tasks, projects, stakeholders, bugs, roadmap, docs] = await Promise.all([
      execute('SELECT *, "task" as _type FROM tasks WHERE title LIKE ? OR description LIKE ? OR assignee LIKE ?', [q, q, q]),
      execute('SELECT *, "project" as _type FROM projects WHERE name LIKE ? OR description LIKE ? OR lead LIKE ?', [q, q, q]),
      execute('SELECT *, "stakeholder" as _type FROM stakeholders WHERE name LIKE ? OR role LIKE ? OR department LIKE ? OR notes LIKE ?', [q, q, q, q]),
      execute('SELECT *, "bug" as _type FROM bugs WHERE title LIKE ? OR description LIKE ? OR assignee LIKE ?', [q, q, q]),
      execute('SELECT *, "roadmap_item" as _type FROM roadmap_items WHERE title LIKE ? OR description LIKE ? OR owner LIKE ?', [q, q, q]),
      execute('SELECT *, "document" as _type FROM documents WHERE title LIKE ? OR description LIKE ?', [q, q]),
    ]);

    if (tasks.length > 0) results.tasks = tasks;
    if (projects.length > 0) results.projects = projects;
    if (stakeholders.length > 0) results.stakeholders = stakeholders;
    if (bugs.length > 0) results.bugs = bugs;
    if (roadmap.length > 0) results.roadmap_items = roadmap;
    if (docs.length > 0) results.documents = docs;

    if (Object.keys(results).length === 0) {
      return { content: [{ type: 'text' as const, text: `No results found for "${args.query}".` }] };
    }

    return { content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }] };
  },
);

const getHistory = tool(
  'get_history',
  'Show recent version history (Dolt commits). Each entry represents a database change with timestamp and auto-generated message.',
  {
    limit: z.number().optional().describe('Number of commits to return (default: 20)'),
  },
  async (args) => {
    const commits = await getCommitLog(args.limit ?? 20);
    return { content: [{ type: 'text' as const, text: JSON.stringify(commits, null, 2) }] };
  },
);

const getHistoryDiff = tool(
  'get_history_diff',
  'Show what changed between two Dolt commits. Provides a summary of which tables changed and how.',
  {
    from_commit: z.string().describe('Starting commit hash'),
    to_commit: z.string().describe('Ending commit hash'),
    table: z.string().optional().describe('Optional: show detailed row-level diff for a specific table'),
  },
  async (args) => {
    const summary = await getCommitDiffSummary(args.from_commit, args.to_commit);
    let result = `Diff summary (${args.from_commit.slice(0, 8)}..${args.to_commit.slice(0, 8)}):\n${JSON.stringify(summary, null, 2)}`;

    if (args.table) {
      const tableDiff = await getTableDiff(args.table, args.from_commit, args.to_commit);
      result += `\n\nDetailed diff for ${args.table}:\n${JSON.stringify(tableDiff, null, 2)}`;
    }

    return { content: [{ type: 'text' as const, text: result }] };
  },
);

const rewindDatabase = tool(
  'rewind_database',
  'Rewind the entire database to a previous state. This is destructive — all changes after the target commit will be lost. Use get_history first to find the right commit hash.',
  {
    commit_hash: z.string().describe('The Dolt commit hash to rewind to'),
    confirm: z.boolean().describe('Must be true to confirm the rewind operation'),
  },
  async (args) => {
    if (!args.confirm) {
      return { content: [{ type: 'text' as const, text: 'Rewind cancelled — confirm must be true.' }] };
    }
    await rewindTo(args.commit_hash);
    return { content: [{ type: 'text' as const, text: `Database rewound to commit ${args.commit_hash}. All subsequent changes have been discarded.` }] };
  },
);

// ── Export MCP Server ───────────────────────────────────────────────────────

export const pmboxMcpServer = createSdkMcpServer({
  name: 'pmbox-database',
  version: '1.0.0',
  tools: [
    listTasks, createTask, updateTask, deleteTask,
    listStakeholders, createStakeholder, updateStakeholder,
    listProjects, createProject, updateProject,
    listBugs, createBug, updateBug,
    listRoadmapItems, createRoadmapItem, updateRoadmapItem,
    listDocuments, createDocument,
    searchAll,
    getHistory, getHistoryDiff, rewindDatabase,
  ],
});

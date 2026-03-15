import { v4 as uuidv4 } from 'uuid';
import { execute, run } from './connection.js';

export async function seedIfEmpty(): Promise<void> {
  const rows = await execute('SELECT COUNT(*) as cnt FROM projects');
  const count = (rows[0] as { cnt: number }).cnt;
  if (count > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  console.log('Seeding database with example data...');

  // Project
  const projectId = uuidv4();
  await run(
    `INSERT INTO projects (id, name, status, lead, start_date, target_end_date, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId,
      'Project Phoenix',
      'in_progress',
      'Sarah Chen',
      '2026-01-15',
      '2026-06-30',
      'Platform modernization initiative — migrate legacy monolith to microservices architecture.',
    ],
  );

  // Stakeholders
  const stakeholders = [
    { name: 'Sarah Chen', role: 'Project Lead / Senior PM', department: 'Product', email: 'sarah.chen@company.com', slack: '@sarah.chen', pref: 'Slack for quick updates, email for formal decisions' },
    { name: 'Marcus Johnson', role: 'Engineering Lead', department: 'Engineering', email: 'marcus.j@company.com', slack: '@marcus.j', pref: 'Slack, prefers async communication' },
    { name: 'Priya Patel', role: 'UX Design Lead', department: 'Design', email: 'priya.p@company.com', slack: '@priya.p', pref: 'Figma comments for design feedback, Slack for general' },
    { name: 'David Kim', role: 'VP of Engineering (Executive Sponsor)', department: 'Engineering', email: 'david.kim@company.com', slack: '@david.kim', pref: 'Weekly email summaries, escalation via Slack DM' },
    { name: 'Lisa Wang', role: 'QA Lead', department: 'Quality', email: 'lisa.w@company.com', slack: '@lisa.w', pref: 'Jira for bug tracking, Slack for urgent issues' },
  ];

  for (const s of stakeholders) {
    await run(
      `INSERT INTO stakeholders (id, name, role, department, email, slack_handle, communication_preference)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), s.name, s.role, s.department, s.email, s.slack, s.pref],
    );
  }

  // Tasks
  const tasks = [
    { title: 'Finalize Q2 sprint plan with engineering', status: 'in_progress', priority: 'high', assignee: 'Sarah Chen', due: '2026-03-20', jira: 'PHX-101' },
    { title: 'Review and approve updated API documentation', status: 'todo', priority: 'medium', assignee: 'Marcus Johnson', due: '2026-03-22', jira: 'PHX-102' },
    { title: 'Schedule stakeholder demo for Sprint 4 deliverables', status: 'todo', priority: 'high', assignee: 'Sarah Chen', due: '2026-03-25', jira: 'PHX-103' },
    { title: 'Update risk register with new vendor dependency', status: 'done', priority: 'medium', assignee: 'Sarah Chen', due: '2026-03-15', jira: 'PHX-100' },
    { title: 'Collect design feedback on new dashboard mockups', status: 'in_progress', priority: 'medium', assignee: 'Priya Patel', due: '2026-03-21', jira: 'PHX-104' },
    { title: 'Prepare executive status report for March', status: 'blocked', priority: 'high', assignee: 'Sarah Chen', due: '2026-03-28', jira: 'PHX-105' },
  ];

  for (const t of tasks) {
    await run(
      `INSERT INTO tasks (id, title, status, priority, assignee, project_id, due_date, jira_ticket_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), t.title, t.status, t.priority, t.assignee, projectId, t.due, t.jira],
    );
  }

  // Bugs
  const bugs = [
    { title: 'Dashboard loading timeout on large datasets', severity: 'high', status: 'in_progress', assignee: 'Marcus Johnson', reporter: 'Lisa Wang', jira: 'PHX-BUG-042' },
    { title: 'User avatar not displaying in mobile view', severity: 'low', status: 'open', assignee: '', reporter: 'Priya Patel', jira: 'PHX-BUG-043' },
    { title: 'Export CSV includes deleted records', severity: 'medium', status: 'investigating', assignee: 'Lisa Wang', reporter: 'Sarah Chen', jira: 'PHX-BUG-044' },
  ];

  for (const b of bugs) {
    await run(
      `INSERT INTO bugs (id, title, severity, status, assignee, reporter, project_id, jira_ticket_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), b.title, b.severity, b.status, b.assignee, b.reporter, projectId, b.jira],
    );
  }

  // Roadmap items
  const roadmapItems = [
    { title: 'API Gateway Migration', quarter: 'Q1 2026', status: 'completed', owner: 'Marcus Johnson', deps: 'None' },
    { title: 'User Authentication Service', quarter: 'Q2 2026', status: 'on_track', owner: 'Marcus Johnson', deps: 'API Gateway Migration' },
    { title: 'Dashboard Redesign', quarter: 'Q2 2026', status: 'on_track', owner: 'Priya Patel', deps: 'None' },
    { title: 'Data Pipeline Modernization', quarter: 'Q3 2026', status: 'planned', owner: 'TBD', deps: 'User Authentication Service' },
    { title: 'Mobile App v2', quarter: 'Q3 2026', status: 'planned', owner: 'Priya Patel', deps: 'Dashboard Redesign' },
  ];

  for (const r of roadmapItems) {
    await run(
      `INSERT INTO roadmap_items (id, title, quarter, status, owner, project_id, dependencies)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), r.title, r.quarter, r.status, r.owner, projectId, r.deps],
    );
  }

  // Documents
  const docs = [
    { title: 'Project Phoenix PRD', type: 'PRD', url: 'https://confluence.company.com/phoenix/prd', desc: 'Product Requirements Document — v2.1' },
    { title: 'Architecture Decision Records', type: 'Technical', url: 'https://confluence.company.com/phoenix/adr', desc: 'ADRs for microservices migration decisions' },
    { title: 'Dashboard Redesign Mockups', type: 'Design', url: 'https://figma.com/file/phoenix-dashboard', desc: 'Figma file with latest UI mockups' },
    { title: 'Sprint Board', type: 'Tracking', url: 'https://jira.company.com/board/phoenix', desc: 'Active sprint board in Jira' },
  ];

  for (const d of docs) {
    await run(
      `INSERT INTO documents (id, title, doc_type, url, description, project_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), d.title, d.type, d.url, d.desc, projectId],
    );
  }

  // Create an explicit Dolt commit for the seed data
  try {
    await run('CALL DOLT_ADD("-A")');
    await execute('CALL DOLT_COMMIT("-m", "Seed initial PM data")', []);
  } catch {
    // Auto-commit may have already committed the data
  }

  console.log('Database seeded successfully.');
}

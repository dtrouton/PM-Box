import { execute, run } from './connection.js';

const TABLES: string[] = [
  `CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('planning', 'in_progress', 'on_hold', 'completed') DEFAULT 'planning',
    lead VARCHAR(255),
    start_date DATE,
    target_end_date DATE,
    description TEXT,
    jira_board_url VARCHAR(512),
    confluence_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS stakeholders (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    department VARCHAR(255),
    email VARCHAR(255),
    slack_handle VARCHAR(100),
    communication_preference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in_progress', 'done', 'blocked') DEFAULT 'todo',
    priority ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    assignee VARCHAR(255),
    project_id VARCHAR(36),
    due_date DATE,
    jira_ticket_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS bugs (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    status ENUM('open', 'investigating', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assignee VARCHAR(255),
    reporter VARCHAR(255),
    project_id VARCHAR(36),
    jira_ticket_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS roadmap_items (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quarter VARCHAR(10),
    status ENUM('planned', 'on_track', 'at_risk', 'delayed', 'completed') DEFAULT 'planned',
    owner VARCHAR(255),
    project_id VARCHAR(36),
    dependencies TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    doc_type VARCHAR(100),
    url VARCHAR(512),
    description TEXT,
    project_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
  )`,
];

export async function initializeSchema(): Promise<void> {
  for (const sql of TABLES) {
    await run(sql);
  }
  console.log('Database schema initialized.');
}

export async function tablesExist(): Promise<boolean> {
  const rows = await execute('SHOW TABLES');
  return rows.length > 0;
}

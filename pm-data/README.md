# PM-Box Project Context

This directory is the working knowledge base for **PM-Box**, your PM assistant. It contains structured context files that the assistant reads to understand your projects, people, tasks, and documentation landscape.

## Directory Structure

```
pm-data/
  projects/       # Project overviews, goals, status, and team info
  people/         # Stakeholder directory and team contacts
  docs/           # Documentation index with links to Confluence, PRDs, etc.
  todos/          # Active task lists and action items
  tracking/       # Bug tracking and issue logs
  planning/       # Roadmaps, quarterly plans, and milestones
```

## How to Use

1. **Edit the files** in each folder to reflect your actual projects, people, and tasks.
2. **Keep them updated** as your project evolves. The assistant relies on this data to give accurate, context-aware answers.
3. **Add new files** as needed. Each folder can hold multiple markdown files (e.g., one per project, one per team).

## Tips

- Use consistent formatting so the assistant can parse information reliably.
- Link to external tools (Jira, Confluence, Figma) using placeholder URLs that you replace with real ones.
- Mark files with a `Last updated:` date at the bottom so you know when context was last refreshed.

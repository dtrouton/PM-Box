# Project Phoenix

**Status:** In Progress
**Project Lead:** Sarah Chen
**Start Date:** 2026-01-12
**Target Launch:** 2026-06-30
**Jira Board:** [PHOENIX Board](https://yourcompany.atlassian.net/jira/software/projects/PHX/boards/42)

---

## Overview

Project Phoenix is a platform modernization initiative to migrate the core billing service from the legacy monolith to a set of event-driven microservices. The project will improve system reliability, reduce deployment cycle time from 2 weeks to under 1 day, and unlock self-service capabilities for the finance team.

## Goals

1. Decompose the billing monolith into 4 bounded-context microservices.
2. Achieve 99.95% uptime SLA for the new billing pipeline.
3. Reduce mean time to deploy from 14 days to < 24 hours.
4. Deliver a self-service dashboard for Finance to manage invoicing rules.
5. Maintain backward compatibility with existing API consumers during migration.

## Timeline & Key Milestones

| Milestone | Target Date | Status |
|---|---|---|
| Architecture design approved | 2026-02-01 | Done |
| Invoice Service MVP deployed to staging | 2026-03-15 | In Progress |
| Payment Processing Service MVP | 2026-04-15 | Not Started |
| Data migration dry-run complete | 2026-05-01 | Not Started |
| End-to-end integration testing | 2026-05-20 | Not Started |
| Production cutover (phased rollout) | 2026-06-15 | Not Started |
| Legacy system decommission | 2026-06-30 | Not Started |

## Team

| Name | Role |
|---|---|
| Sarah Chen | Project Lead / PM |
| Marcus Williams | Tech Lead |
| Anika Patel | Backend Engineer |
| James O'Brien | Backend Engineer |
| Yuki Tanaka | Frontend Engineer |
| Priya Sharma | QA Lead |
| David Kim | DevOps / SRE |

## Risks & Dependencies

- **Risk:** Data migration from legacy DB may surface inconsistencies in historical invoice records. *Mitigation:* Run reconciliation scripts during dry-run phase.
- **Dependency:** The Payment Processing Service depends on the new API gateway (owned by Platform team, ETA March 30).
- **Risk:** Finance team availability for UAT is limited in May due to quarter-close. *Mitigation:* Schedule UAT sessions in early May, before close begins.

## Key Decisions

| Date | Decision | Decided By |
|---|---|---|
| 2026-01-20 | Use event sourcing for invoice state management | Marcus Williams, Sarah Chen |
| 2026-02-05 | PostgreSQL over DynamoDB for transaction store | Marcus Williams |
| 2026-02-18 | Phased rollout (10% -> 50% -> 100%) instead of big-bang cutover | Sarah Chen, VP Engineering |

## Links

- [Technical Design Doc](https://yourcompany.atlassian.net/wiki/spaces/ENG/pages/123456/Phoenix+Technical+Design)
- [PRD](https://yourcompany.atlassian.net/wiki/spaces/PRODUCT/pages/789012/Phoenix+PRD)
- [Figma Mocks - Finance Dashboard](https://www.figma.com/file/PLACEHOLDER/Phoenix-Dashboard)
- [Slack Channel: #proj-phoenix](https://yourcompany.slack.com/channels/proj-phoenix)

---

*Last updated: 2026-03-15*

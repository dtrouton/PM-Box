# Project Phoenix Roadmap - 2026

High-level quarterly plan with key deliverables, milestones, and dependencies.

---

## Q1 (January - March): Foundation

**Theme:** Architecture, scaffolding, and Invoice Service MVP

| Deliverable | Target Date | Owner | Status |
|---|---|---|---|
| Architecture design review and approval | Jan 30 | Marcus Williams | Done |
| CI/CD pipeline and staging environment | Feb 15 | David Kim | Done |
| Invoice Service MVP deployed to staging | Mar 15 | Anika Patel | In Progress |
| Invoice event schema finalized | Mar 20 | Marcus Williams | In Progress |
| PCI compliance pre-assessment | Mar 31 | Daniel Russo | Not Started |

**Dependencies:**
- Legacy DB read-replica access required from IT (requested, ETA mid-March).

---

## Q2 (April - June): Core Services & Migration

**Theme:** Payment Processing Service, data migration, and production cutover

| Deliverable | Target Date | Owner | Status |
|---|---|---|---|
| Payment Processing Service MVP | Apr 15 | James O'Brien | Not Started |
| API Gateway integration complete | Apr 30 | Platform Team / Marcus Williams | Not Started |
| Data migration dry-run #1 | May 1 | Anika Patel | Not Started |
| Finance Dashboard beta release (internal) | May 10 | Yuki Tanaka | Not Started |
| End-to-end integration testing | May 20 | Priya Sharma | Not Started |
| PCI compliance final review | May 25 | Daniel Russo | Not Started |
| Production cutover - Phase 1 (10% traffic) | Jun 1 | David Kim | Not Started |
| Production cutover - Phase 2 (50% traffic) | Jun 10 | David Kim | Not Started |
| Production cutover - Phase 3 (100% traffic) | Jun 20 | David Kim | Not Started |
| Legacy billing system decommission | Jun 30 | Marcus Williams | Not Started |

**Dependencies:**
- API Gateway v2 release by Platform Team (ETA Mar 30).
- Finance team availability for UAT before quarter-close (schedule by early May).
- Security sign-off on data migration plan before dry-run.

---

## Q3 (July - September): Optimization & Self-Service

**Theme:** Performance tuning, Finance self-service features, and observability

| Deliverable | Target Date | Owner | Status |
|---|---|---|---|
| Post-migration performance benchmarking | Jul 15 | Marcus Williams | Not Started |
| Finance Dashboard GA release | Jul 31 | Yuki Tanaka | Not Started |
| Self-service invoicing rules engine | Aug 30 | Anika Patel | Not Started |
| Billing analytics and reporting module | Sep 15 | James O'Brien | Not Started |
| Observability dashboard (Datadog/Grafana) | Sep 30 | David Kim | Not Started |

**Dependencies:**
- Stable production baseline after Q2 cutover.
- Finance team requirements for self-service rules (gather in June).

---

## Q4 (October - December): Scale & Iterate

**Theme:** Multi-region readiness, advanced features, and knowledge transfer

| Deliverable | Target Date | Owner | Status |
|---|---|---|---|
| Multi-region deployment support | Oct 31 | David Kim | Not Started |
| Advanced billing scenarios (proration, credits, usage-based) | Nov 30 | Anika Patel / James O'Brien | Not Started |
| Internal knowledge transfer and documentation | Dec 15 | Sarah Chen | Not Started |
| Project Phoenix retrospective and close-out | Dec 20 | Sarah Chen | Not Started |

**Dependencies:**
- Infrastructure team multi-region strategy alignment (begin discussions in Q3).
- Product decision on which advanced billing scenarios to prioritize (by end of Q3).

---

## Roadmap Visual Summary

```
Q1  [===========>            ] Foundation & Invoice Service
Q2  [          =============>] Payment Service, Migration, Cutover
Q3  [                   =====>] Optimization & Self-Service
Q4  [                        =>] Scale & Iterate
```

## Key Cross-Team Dependencies

| Dependency | Owner Team | Needed By | Status |
|---|---|---|---|
| API Gateway v2 | Platform | Apr 30 | On Track |
| Legacy DB read-replica | IT / DBA | Mar 15 | Requested |
| PCI compliance review slot | InfoSec | May 25 | Not Yet Scheduled |
| Multi-region infra strategy | Infrastructure | Sep 30 | Not Started |

---

*Last updated: 2026-03-15*

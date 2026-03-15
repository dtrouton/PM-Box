# Bug Tracker

Active and recently resolved bugs for Project Phoenix. All bugs are tracked in Jira under the PHX project.

**Jira Filter:** [Open Phoenix Bugs](https://yourcompany.atlassian.net/issues/?filter=10042)

---

## Open Bugs

| Jira ID | Summary | Severity | Status | Assignee | Reported | Notes |
|---|---|---|---|---|---|---|
| PHX-187 | Invoice Service returns 500 on duplicate idempotency key | Critical | In Progress | Anika Patel | 2026-03-10 | Happens when client retries within 50ms window. Fix in PR #312. |
| PHX-192 | Dashboard date picker off by one day in UTC-negative timezones | Medium | Open | Yuki Tanaka | 2026-03-12 | Reproducible in US/Pacific. Suspected Day.js UTC handling issue. |
| PHX-195 | Kafka consumer lag spikes during batch invoice generation | High | Open | James O'Brien | 2026-03-14 | Lag exceeds 10k messages when >500 invoices created in single batch. Needs partition tuning. |
| PHX-198 | Staging environment healthcheck endpoint returns stale build version | Low | Open | David Kim | 2026-03-15 | Cosmetic issue - healthcheck JSON reports previous deploy hash. |

## Recently Resolved

| Jira ID | Summary | Severity | Resolution | Resolved By | Date |
|---|---|---|---|---|---|
| PHX-180 | Invoice PDF generation fails for non-ASCII characters | High | Fixed | Anika Patel | 2026-03-05 |
| PHX-175 | Missing index on invoice_events table causes slow queries | Medium | Fixed | Marcus Williams | 2026-02-28 |
| PHX-168 | CORS headers missing on Invoice Service staging | Low | Fixed | David Kim | 2026-02-22 |

## Severity Definitions

| Severity | Definition | Response SLA |
|---|---|---|
| Critical | Service down or data loss risk in production | 4 hours |
| High | Major feature broken, no workaround | 1 business day |
| Medium | Feature impaired, workaround exists | 3 business days |
| Low | Cosmetic or minor inconvenience | Next sprint |

---

*Last updated: 2026-03-15*

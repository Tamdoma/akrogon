# Issue-to-merged view

## Question
Q3: Add one derived issue-to-merged view to `akrogon timing` (3a), or keep measuring by hand (3b)? And pause factory rule changes until about 20 leaves run under today's rules?

### Carries
- M2 in slots/map-merged.md (A,B,D): one derived table, no new state; gain 0 h directly, it aims the next change at the real constraint.

## Findings
- Seeds carry no filing time (D). `gh api repos/<o>/<r>/issues?state=all` returns `created_at` for every issue, open and closed (proof below).
- Existing views: `akrogon status` prints blocked-by per leaf and `akrogon status --charts` prints chart stage and age, so those columns are not repeated. `akrogon timing --cohort --since <iso>` already measures the first 20 leaves after a marker (src/timing-report.ts), so the pause comparison needs no new code.
- Proof 2026-10-15, identity: operator's `gh` login on this host (gh 2.102.0): `gh api --hostname github.com 'repos/Tamdoma/akrogon/issues?state=all&per_page=100' --paginate --slurp` returned 1 page, 89 items, all with `created_at` and `closed_at`, 0.9 s; the same call for Tamdoma/tamdoma-framework returned 3 pages, 257 issues after dropping pull requests, all with `created_at`. Read-only, no cleanup. Limits: does not prove transferred or deleted issues appear, or behavior above 100 pages.

## Taken
Operator 2026-10-15: "3a". Small akrogon lifecycle leaf. No new factory rule changes until about 20 leaves run under today's rules, then compare with `akrogon timing --cohort --since 2026-10-15T07:25:26Z` (ed0a05d, the last Q1 landing).

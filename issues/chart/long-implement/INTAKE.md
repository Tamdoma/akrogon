# Intake: long-implement

## Scope
One destination: akrogon skills (plan-issue, implement-issue, worker-protocol, possibly watch-issues), so a leaf's implement and check.fix stop taking over 2 hours on serial worker runs and repeated proof loops. No consumer repo change in a leaf.

## Provenance
- GitHub: Tamdoma/akrogon#51
- Operator: chart-issues door 2026-10-01

## Source: Tamdoma/akrogon#51
# Leaf phases have no duration ceiling: 19% of implement phases exceed 2h, and a check.fix ran 2h+ with no alert

Source: Tamdoma/akrogon#51
URL: https://github.com/Tamdoma/akrogon/issues/51

Unverified intake.

## Observation
From `issues/log.jsonl` of consumer repo `framework` (wall time between phase records, so some long phases may include idle or parked time):

- `implement`: 247 phases, median 27m, p90 175m, 48 phases (19%) over 120m. Recent ones include `emdash-deploy-profile` 192m, `emdash-kit` 222m, `emdash-conversion` 508m.
- `check.fix`: 122 phases, median 8m, p90 52m, 2 over 120m.
- `check.review`: 361 phases, median 5m, p90 17m.
- 98 of 236 leaves had at least one fix round, 4 had three or more.

Example leaf `emdash-launch` (10 acceptance criteria, 36 files, about 6.5k added lines): `implement` 10:44 to 14:21 UTC (3h37m), then `check.review` returned 10 blocking findings from seat B and `fix` from seat A, then `check.fix` ran from 14:32 UTC for over 2h with no commit between 15:31 and 16:45 UTC while the seat debugged a Cloudflare cron check on a live fixture. Four other leaves stayed blocked on it the whole time.

akrogon's stall notice (`src/next.ts`, `STALL_MS` = 60 minutes, `observeBusy`) is only called from the `next` path. During a watch where every other leaf was blocked, `akrogon next` was not run for this leaf, and `notified=` stayed empty on every observe line, including at 2h39m.

Related reports in `Tamdoma/tamdoma-framework`: #116 (stall notice only in `next`), #117 (no time or attempt bound in `implement-issue`), #118 (`watch-issues` busy-seat reads).

## Location
akrogon lifecycle phases `implement` and `check.fix`; `src/next.ts` stall check; `implement-issue` and `plan-issue` skills; consumer repo `framework`, leaf `emdash-launch` (path `issues/open/emdash-cms/emdash-build/emdash-launch`).

## Reproduction
Seen across the log history above and once in detail for `emdash-launch`. Frequency: about 1 in 5 `implement` phases exceeds 2h.

## Expected behavior
Not provided.

## Urgency
Long phases hold dependent leaves blocked (four were blocked on `emdash-launch`) and raise cost. Workaround: the operator reads the seat manually and interrupts it with `herdr agent send-keys <pane> esc`, then sends a wrap-up prompt.

## Source: operator 2026-10-01 door note
Look at the pulled isssue. I'm losing my mind over these long sessions that take more than 2 hours for a leaf to merge. This is not how it's supposed to work. Find a solution for this problem. Consult with both slot b and c, they're active panes in your tab. Please, come up with an elegant solution.

## Agent findings
See slots/map-merged.md (A, B, C blind maps merged with attribution).

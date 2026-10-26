# Design: one-test-run

## Binding decisions, verbatim

From issues/chart/akrogon-test-line/forks/line-scope.md, Taken (A's pick under autopilot, 2026-10-26, `1a 2a`):

1a: restore the repo config list `full` (names from `checks` or `merge_checks`), set to `[test]` only in akrogon's issues/config.yaml, as a pending main step after the leaf lands and the deploy record shows its release. Runs already started before that edit may still overlap once: stated residual. (A,B; A correction 2026-10-26 after B leaf review F1: `akrogon status` cannot show a drain, so the "no live test run" condition was dropped) Reason: a config list is the existing pattern for per-repo check settings and stays discoverable; a repo name inside the tool's code is a hidden special case that needs a release to move. Rejected 1b (fixed akrogon/test rule in code). Standing dissent (B): 1b needs no config activation step.

2a: `akrogon stop-run <id>` cancels a waiting run within its current scope-ownership check: under the admission lock the record moves to a cancel state the promotion and the vanished-record rewrite both respect, and the waiter exits without running its command, with a non-zero exit. Reason: stop-run is the only sanctioned stop; without this a stuck waiter can only be cleared by killing processes. Rejected 2b (no cancel, residual).

Binding decisions agreed in the map (A,B):
- Per-repo line: only runs of the same registered repo whose check name is in that repo's `full` list join one queue; no other repo waits on it. Arrival order by registration time with a deterministic tie-break; a waiting record is written before waiting; selection and promotion run under one short lock released before polling or running the command.
- Nesting: a line run inside a run that already holds the same repo's line is nested and creates nothing; inside any other run (another check, another repo) it takes its own turn.
- `ended` records keep the line until unit shutdown and record removal finish. After a killed wrapper a waiter may start up to ~5 s early (TimeoutStopSec=5): stated residual.
- Wait stays in `wait_ms`, separate from run time.
- Waiting records are visible to reconcile's slice protection and to state-home migration's live-record count.
- `akrogon status` shows the line with the existing table renderer only while at least one run waits: holder first, then waiters in queue order, with repo, leaf, check, state, age and run id.
- One stderr line on the waiting run names the holder.
- Raw `bun test` and other check names stay outside the line: stated residual. A stopped head waiter stays visible as `waiting 1` with no automatic timeout: stated residual, cleared with stop-run (2a).
- Tests use their own state home and fixture commands with handshakes, no heavy suite copies and no timing thresholds.

Earlier decisions this leaf keeps (issues/chart/host-run-load/forks/full-suite-line.md, operator 2026-10-24): the status table appears "ONLY if there's waiting"; small and targeted runs never wait. Its host-wide bound is replaced by the per-repo bound above (operator O7, revert 20455420).

Locks (chart suite-time and standing): no per-test timeout raises, no `--retry` or `test.serial`, no removing tests; runs are stopped only with `akrogon stop-run <id>`; never open or write `.env` or `.env.*`.

Standing design: /home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Interpretation for this leaf: no auth, secrets, browser, model or outside call is involved. Every criterion is proven at the real CLI or module boundary inside the repo's existing test runner, with temporary repos, a temporary state home and fixture commands that signal through files (handshakes), never real suite copies or wall-time thresholds. Criteria 1-5 extend tests/run-permit.test.ts, whose existing helpers already start runs against a temporary state home. The removed cases in commit 20455420 are a starting point; the old two-repo case asserted host-wide blocking and is inverted by criterion 2. New behavior shows one deliberate break turning its test red. No machinery is built.

## Leaf architecture

Owned surfaces:
- src/config.ts `repoSchema`: field `full: z.array(text).default([])`, each entry validated against `checks` and `merge_checks` keys (criterion 8).
- src/admission.ts: `AdmissionHolder.full: boolean`; record state gains `waiting` and a cancel state; a per-repo queue reader (the reverted `fullSuites`, filtered to the holder's repo); the wait loop (the reverted `awaitFullTurn`) with selection and promotion under one lock, the stderr line, the vanished-record rewrite that respects cancel; `nested(token, repo, full)` per the nesting decision; `withAdmission` writes `waiting` before waiting and keeps `wait_ms`.
- src/run-check.ts `checkedRun`: passes `full: repo.config.full.includes(name)`.
- src/stop-run.ts `stopRunCommand`: a waiting record owned by the caller's scope is cancelled instead of unit-stopped, under the admission lock, keeping the scope and process-identity checks; cancel frees queue selection whether or not the waiter process is running. (A,B)
- src/status.ts `statusCommand`: the line table, shown only while a run waits, using the leaf table renderer.
- src/reconcile.ts `stopSlice`, `reconcile`, `reconcileHost` and src/state-home.ts `liveRecords`: count waiting records as live. (A,B)
- docs/reference/checks.md, docs/reference/config.md (field row and example), src/AREA.md (admission line).
- tests/run-permit.test.ts, and the existing tests of status, stop-run, reconcile and state-home where a criterion's boundary lives there.

Consumers of the changed record states:
- `liveRuns` (src/admission.ts) returns `live` records only today. Its callers are `stopRunCommand` (needs waiting records to cancel them), and `stopSlice`, `reconcile` and `reconcileHost` in src/reconcile.ts (each builds slice protection from it and needs waiting records). Open for the plan: widen `liveRuns` or add a separate reader, checked against each of these callers. (A,B)
- `sweepStale` treats a record it cannot parse or whose writer is gone as stale and stops its units. A waiting record has no units yet, so stopping is a no-op. The precondition to keep: a live waiter's record still parses.
- Old binaries still running at deploy parse `waiting` as unreadable and may sweep it. The waiter rewrites a vanished record with its original time unless it was cancelled. An old binary, or a new one that read config before the `full` edit, admits its own runs at once: a one-time activation residual. (A,B)

Exclusions:
- Setting `full: [test]` in akrogon's issues/config.yaml is the chart door's pending main step (issues/chart/akrogon-test-line/CHART.md Pending steps), never in this leaf's branch.
- Other repos' configs stay unchanged.
- The fewer-repeat-calls criterion 5 pairs run under `run-check --name c5r2-pair-*`, outside any `full` list, so they are unaffected.

Stated limits: raw `bun test` and unlisted names stay outside the line; a SIGSTOPped head waiter blocks its repo's line until stop-run cancels it, and the suspended process itself exits only when resumed (A,B); a waiter may start up to ~5 s early after a killed wrapper, so criterion 1 covers normal completion and criterion 4 covers crashes (A,B); runs started before the `full` edit may overlap once; the leaf proves the line works, not that suites run faster overall.

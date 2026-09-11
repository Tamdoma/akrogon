# Implementation brief

## 1. Goal
Implement plan D1–D6 for failure delivery records and per-physical-seat busy warnings/status. The authoritative plan is ../plan.md.

## 2. Numbered acceptance criteria
1. C1/C2: default fields, three failed sweeps yield one delivery, failed delivery retries, phase transition resets delivery and a new failure episode notifies again.
2. C3/C4/C5: persist first busy observation, strict >60-minute threshold, one successful warning per episode, independent physical seats including fallback and merge, idle/done/agentless clearing, retry on delivery error without attempts or phase changes. Preserve observations across dispatch saves.
3. C6: read-only status NOTE displays busy A 1h02m with short/both-seat/empty cases.
4. C7: root agent produces real CLI evidence in implementation/cli-artifact.log after worker completion. Worker supplies red/green changed-test evidence.

## 3. Read-first list
Read ../plan.md and its read-first files, docs/next.html and docs/state.html before editing, and /home/ivan/.codex/skills/implement-issue/ponytail.md. Copy the temporary repository/real CLI pattern in tests/next.test.ts, using tests/fake-herdr.ts at the external boundary. All source paths refer to /home/ivan/Work/infra/akrogon/issues/worktrees/failure-signals.

## 4. Change list and needed interfaces
src/state.ts adds failed_notified and busy_since/busy_notified maps per D1. src/phase.ts resets failed_notified in commitMove. src/next.ts implements notification persistence and physical-seat observation per D2–D5. src/status.ts adds duration text per D6. Extend existing tests/next.test.ts, tests/status.test.ts and tests/phase.test.ts as needed. No new dependencies. Private observation returns updated State and all later saves must use it. Root owns the external CLI harness and final checks/report/commit.

## 5. Do-not, reasons and exceptions
Do not alter routing, attempt accounting, hooks, configuration, error boundaries, pane allocation or add automatic failure because scope is warning/deduplication only. Do not edit docs or unrelated code because the plan and user exclude adjacent work. Never contact live herdr or GitHub from tests. Do not commit or advance phase because root owns the handoff. Return a mismatch with evidence rather than changing scope or an interface, unless root revises this brief. These exclusions preserve locked behavior and isolation, and only a revised brief authorizes an exception.

## 6. Ordered steps
Derive tests for criteria 1–3 before source edits, run the changed-test command to show the bug failing, then implement state/transition, dispatch and status in that order. Run changed tests again and repair within scope. Record evidence below. Advisory size is seven source/test files and about 20 turns. Return a mismatch if materially beyond this scope rather than truncating needed work.

## 7. Commands
AKROGON_BASE=9dc1055a0a1ba3682335622d81f41873de966f11 bun test --changed=9dc1055a0a1ba3682335622d81f41873de966f11
Run only this test command. Root runs full suite, formatting and typecheck.

## 8. Done-when, evidence and report
Criteria 1–3 pass meaningful real CLI tests, with demonstrated red then green evidence. Report changed files/reasons, exact commands/results, limitations and any unverified criteria before returning. Temporary repositories use fake herdr and no real socket or panes.

Changed files and reasons: `src/state.ts` supplies backward-compatible delivery and physical-seat timestamp defaults. `src/phase.ts` resets failure delivery on every transition while retaining busy observations. `src/next.ts` records successful failure delivery, observes physical seats before phase filtering and merge waiting, retries failed warnings, and preserves observations through dispatch saves. `src/status.ts` displays per-seat durations in NOTE. `tests/next.test.ts`, `tests/phase.test.ts`, and `tests/status.test.ts` verify real CLI outcomes, controlled exact-hour boundaries, retry/deduplication, fallback and merge seats, idle/done/agentless clearing, unknown-agent retention, transition preservation, and read-only status.
Tests run: exact command `AKROGON_BASE=9dc1055a0a1ba3682335622d81f41873de966f11 bun test --changed=9dc1055a0a1ba3682335622d81f41873de966f11`. Before source edits: exit 1, 36 pass / 7 fail across 2 files, with missing state defaults/stamps/delivery records and status rejection. After implementation: exit 0, 53 pass / 0 fail across 3 files. After final fallback/unknown/merge/transition regressions: exit 0, 54 pass / 0 fail, 524 assertions across 3 files in 25.82s. Fixtures used temporary repositories and fake herdr only, cleaned in finally blocks.
Known limitations: plan R1/R2/R3.
Unverified criteria: worker criteria 1–3 verified. C7 artifact and full checks remain root-owned. Root reports its independent CLI harness already passed. No worker commit or phase transition was made.

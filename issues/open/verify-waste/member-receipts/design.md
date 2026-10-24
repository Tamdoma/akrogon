# Design: member-receipts

## Binding decisions, verbatim

### receipts (issues/chart/verify-waste/forks/receipts.md)

Taken by A under autopilot 2026-10-24, consultants B (codex) and D (claude-fable-5-1). These are A's picks, not operator words.

- Q1 Member receipts (A,B,D). The gate passes when every member is green or covered by the existing known-red rule per member (B R3). Cancelled, not-started or setup-failed members never count green (B). Members are listed once, in the destination's config, not copied from package.json (B). The same-tree input assumption already behind tree reuse is extended to members and named in the design (B,D). No new admission permit, so runs still start immediately (B R5).
- Q2 Not taken: operator lock "a failing run shows every failure". No cancellation at first red.
- Q3 The base side uses the same member-receipt reuse as the head (D). Reason: a green base result makes a red head member fail the comparison, so a stale receipt can block a merge but never pass one. Dissent B R1-R2 held below.

## Shape

- A member is one `merge_checks` entry. No new config key: `merge_checks` entries run concurrently, `checks` stay sequential and run first. Today only framework has a non-empty `merge_checks`, with one entry, so no current repo changes behavior until it splits its suite. (A)
- Each member runs through the existing `checkedRun` with its own name and log, so each keeps its own systemd scope and `akrogon stop-run` handle. Admission is unchanged (src/admission.ts:139-144 starts runs at once). (A,B)
- Stage order: `merge_checks` start only when every `checks` entry of the run is green, fresh or reused. Otherwise each member gets a not-run entry with a non-zero exit, so it never counts green or reusable. This is framework's existing cheap-first stage, not cancellation, so the operator's "every failure shown" lock holds inside each stage. (A)
- Concurrency failure path: the run waits for every member to settle before writing `end` and before removing the worktree in `finally` (src/verify.ts:347-368). A thrown member leaves `end` unset, so the run is incomplete. (B)
- Receipt order: entries are written in `verifyCommands` order, not completion order, so `sameCommands` (src/verify.ts:68-73) and index pairing keep working. Pairing by name is equally acceptable if the implementer finds it simpler. (D)
- Reuse key: tree, scope, name and command text, from a completed run (end set and setup 0) whose entry has exit 0. A reused entry carries an optional `reused` field holding the source run id, and copies the source exit and log, so `akrogon log` still reaches the original log. The field is optional because `verifyRunSchema` is strict and every reader parses the whole ledger (src/verify.ts:19-52, src/land.ts:57, src/reconcile.ts:542, src/flaky.ts:64). (D)
- Same-tree assumption, named: a command's result depends only on the tree and the command text. Host state, env values and time are outside the key, the same as today's whole-run tree reuse (src/verify.ts:97-106). (A,B,D)
- `merge_covers` keeps its meaning: a covered `checks` entry is skipped in merge scope.
- Known-red, per command: for each red expected command on the head tree, some completed head run holds it red with extractable names, and a base run comparing that head run holds the same command with exit not 0 and every head failing name. A base entry with exit 0, reused or fresh, never covers, whatever its log says (today src/verify.ts:117-118 reads names without checking the base exit). Commands green on the head need no base cover. (B,D)
- `knownRedReceipt` pairs the base through `compares` (src/verify.ts:137). A head command red in run 1 is covered by a base run comparing run 1; each red command may be covered by a different pair. (D)
- Base runs still run every command that has no green result on the base tree, including commands green on the head, because `newRedUnits` (src/verify.ts:190-191) reads them for the main-red notice. Trimming the base to red head commands removes that notice and is out of scope. (D)
- The main-red notice reads only base entries without `reused`, so a reused green never raises or clears a notice. (A)
- `akrogon flaky` skips entries with `reused` in `flips` and `flakyLines` (src/flaky.ts:25-43), so reuse adds no observation. (B,D)
- Root-state guard: owned by the framework leaf, which wraps each member command in `run-with-root-state-guard.ts`. Every member's before/after check covers its own interval, so any root change while members run turns at least one member red. This leaf adds no guard. (A; B F1 and D 1 asked for a named owner)

## Held dissent

B R1-R2: run each red head member fresh on the base under an amended completeness contract, because a green base receipt could be stale after environment drift. Accepted loss under A's pick: drift on main shows as a head red that check.fix cannot reproduce. Observed 0 of 9 base reds in 11 days were drift.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Proofs use the repo's existing test runner and a temporary git repo with a registered config whose checks are small shell commands (sleep, exit 1, print a fail line, touch a marker). No suite runs, no herdr, no model call. Concurrency is shown by markers written at start and end, not by wall time. Interpretation: criteria 10-12 are the consequential edges of the per-command known-red rule written now, so no case is added after planning.

## Leaf architecture

- Owned surfaces: src/verify.ts, the receipt schema, src/flaky.ts where it reads receipt entries, their tests, the docs pages describing verify and receipts, and the fresh-base lines in skills/merge-issue/SKILL.md:79, skills/check-issue/SKILL.md:69, skills/implement-issue/SKILL.md:40 and skills/chart-issues/SKILL.md:113. (B,D)
- Not owned: framework config, package.json and the root-state guard (framework leaf), run-check and `--scope merge` (suite-refusal).

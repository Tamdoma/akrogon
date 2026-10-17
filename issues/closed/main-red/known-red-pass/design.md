# Design: known-red-pass

## Binding decisions, verbatim

### base-red / red-base-policy (issues/chart/base-red/forks/red-base-policy.md)
Autopilot pick by A, 2026-10-17 (not operator words; mode record in CHART.md). Round recommendation was 1a (leaf continues, landing waits); A picked the reduced known-reds-pass option C proposed after the round was first shown.

Decision: a red that is also red on the exact base passes the verify gates; nothing waits, nothing is marked `failed` for a base red, and nothing resumes.
- Trigger: only after the same-head retry stays red and the seat judges no cause in the diff (skills/implement-issue/SKILL.md:40, skills/check-issue/SKILL.md:69, skills/merge-issue/SKILL.md:77 judgment gates stay).
- `akrogon verify` runs the exact base fresh, never reusing a receipt on the base side: `$AKROGON_BASE` for a leaf, the stack target for merge, the default-branch tip the attempt rebased on for direct.
- It passes only when every nonzero head command yields a non-empty set of failing units from the existing extraction, every head unit is red on the base, and both runs completed with setup 0. A command with no extractable units (typecheck, format) or an empty set blocks, as does an incomplete, timed-out or setup-failed run on either side (B F1, C D2).
- The seat reads both logs and judges runner completeness and causal fit; that judgment is recorded in the report or review, as `inconsistent` is today (C D2, D3).
- `requireGreenReceipt` accepts such a linked head+base pair wherever it accepts a green receipt: check.review move, check.repair to merge, merge --check, direct-guards. One rule for lifecycle and direct (B F3 earlier, C).
- Done-criteria proofs are outside verify and stay blocking (10-10 boundary).
- The seat-skill sentence "every commit on the default branch passed verify, so a red with no cause in the diff is never handed off as a base defect" is replaced by this rule.
Reason: the operator's own words on 2026-10-10 ("I can't have failed. It needs to show exactly what is. Also, why does it have to wait for the main?") are the strongest operator-tier evidence on this exact question; dc2e2b0 reversed the policy with no recorded reason while deleting 3242 lines, and this form keeps that deletion (no base-run verb, no red-record file, no seat comparison records). It removes the wait state, the resume step and the per-leaf `failed` stops, the fewest moving parts of the options that solve the reported toil. Holding at merge (1a) would move the pileup into the merge queue, the #67 pattern.
Accepted costs and limits: one fresh base run per affected leaf while main is red; a new break inside an already-red unit can land unseen; main stays red until the operator charts the repair from a notice. This delivers no run-once detection and no assigned repair owner, a scope difference from the intake wording (B F5, C D6).
Rejected: 1a hybrid (merge-queue pileup, landing freeze while main is red); 1b shared wait (most machinery, 10-10 foreclosed wait states, stale-clear race class); 1d today (three incidents in 10 days, manual moves); restoring the deleted trio (C).
Standing dissent: B's blind pick was 1b; B holds that known-red continuation is a throughput choice with weaker detection, not equal protection (rebuttal-2 F3).

### Exclusions
- The notice to the operator (red-notice Q1) is owned by main-red-notice, which consumes the linked base run records this leaf writes. This leaf sends no notification.
- The expiring-time rule (red-notice Q2) is owned by expiring-time-rule.

## Standing design
/home/ivan/.akrogon/releases/6f31ca94490e98f0306e77a7ad63316cef314b45/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proof is own tests at the CLI and function boundary in the existing suite (`bun test`), using temporary repos and the existing helpers in tests/helpers.ts; no new proof machinery. New behavior shows one deliberate break turning its test red. The fresh base run is a real `akrogon verify` run of real commands in a temporary repo, never a faked receipt.

## Leaf architecture
Owned surfaces: src/verify.ts, src/flaky.ts (exporting the failing-test extraction for reuse), src/akrogon.ts CLI wiring for the flag, skills/chart-issues/scripts/direct-guards.ts only if its call changes, skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md, skills/merge-issue/SKILL.md, skills/chart-issues/SKILL.md (the direct landing step only) (A,B,C), src/AREA.md verify line, tests. skills/plan-issue/SKILL.md is owned by expiring-time-rule, including its "main is green by the receipt gate" clause, because both edits sit on one line. (A,C)

Interfaces:
- CLI: `akrogon verify [--sha <rev>] [--attempt <id> | --holder <path>] --known-red`, the existing options (src/akrogon.ts verify case) plus one boolean. Scope and caller resolution are unchanged (`verifyCaller`). (A,B)
- With `--known-red`: the head half is the most recent completed run for the tested tree, scope and current command set with setup 0 and at least one nonzero command; when none exists the head is run first exactly as plain verify does. The base is `git merge-base <tested sha> <remote>/<default_branch>`, checked out and run fresh by the same run path as plain verify, never through `greenRun` reuse. Its record carries a new optional field `compares: <head run id>` on `verifyRunSchema`. The command prints `verify known-red <sha>: pass|fail` and exits 0 only on pass.
- `requireGreenReceipt(repo, sha, scope)`: passes on `greenRun` as today, else on a qualifying pair for that tree and scope, where qualifying is the What rule. Failing test names come from the existing extraction in src/flaky.ts; its `(no test name)` and `(log gone)` placeholders count as no names.

State and consumers:
- `verifyRunSchema` gains `compares`. Consumers that parse every record: src/flaky.ts `flips` (keys on tree and command, base runs carry the base tree so a base red then a later green main run reads as a flip; Open for the plan: whether base-half runs are excluded from `flips` or kept as real observations of main), src/reconcile.ts (reads runs during cleanup; Open for the plan: confirm its use is unaffected by records whose `leaf` names the caller but whose sha is the base), tests/keep-rule.test.ts and tests/helpers.ts fixtures.
- Gate callers that rely on `requireGreenReceipt`: src/phase.ts check.review move and check.repair to merge (leaf scope), `merged --check` and batch push (merge scope), skills/chart-issues/scripts/direct-guards.ts (merge scope). Their call sites stay; only the accepted evidence widens.
- Seat skills: the judgment gate (one retry, no cause in the diff) stays as written; the sentence claiming every default-branch commit passed verify is replaced by the `--known-red` step plus reading both logs and recording the completeness and causal-fit judgment in the report or review (A,C). merge-issue's red-rerun ending runs `akrogon verify --attempt <id> --known-red` before `check.fix`; a pass goes on to `merged --check`.
- Direct landing (skills/chart-issues/SKILL.md landing step 3): after a red plain verify on the rebased head, one same-head retry, the door's no-cause judgment, then `akrogon verify --holder <chart>/direct --known-red`; direct-guards (step 4) then accepts the pair; a failing known-red result is the blocking landing-check failure the repair bound counts. (A,B,C)
- Open for the plan: whether the head half may be a run from a different process when the same tree and scope already has a completed red run, or must be the run immediately preceding (reuse is allowed by the rule; the plan names the selection).

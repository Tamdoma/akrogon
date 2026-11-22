# Kept run root

## Question

Autopilot round 1 (printed in A's terminal 2026-11-20). Q1 how a red run's root escapes both deletions (1a marker `.akrogon-kept`, skipped silently by reconcile and ownerKeeps; 1b stop dropping dead-owner roots). Q2 which exits keep (2a every nonzero not-refused exit; 2b only a non-empty root). Q3 which callers (3a every `checkedRun` caller; 3b run-check only by parameter). Q4 lifetime (4a existing leaf temp release, holder runs until the idle sweep; 4b 60-minute holder window). Q5 announce (5a silent; 5b one stderr line).

### Carries

- Signposts (forks/signposts.md `## Taken`, A's): 1a fewest parts, 2a green unchanged and no veto or manual cleanup, 3a akrogon owns it with no driver change, 4a printed path stays valid in place, 5a free local proofs.
- Prior operator answer, issues/closed/worktree-isolation/check-env/design.md `### Outputs` Taken 2026-10-10, verbatim: "We need to make sure that all of the leftovers are always cleaned up unless it's logs or something that we will need in the future. So even this is too big. I don't want any gigabytes to be on the disc for no reason. I want the repo to be clean and up to date." Door reading then: run root removed at run end; the reconciler removes run roots whose process is gone.

## Findings

- Blind notes: slots/map-A.md, slots/map-b.md, slots/map-c.md. Merge: slots/kept-run-root-merged.md. Rebuttals: slots/kept-run-root-rebuttal-b.md, slots/kept-run-root-rebuttal-c.md. Final-shape check: slots/kept-run-root-final-shape.md, B and C "none" (slots/kept-run-root-final-check-b.md, -c.md).
- Research: better-than-training · src/run-check.ts `checkedRun`, src/reconcile.ts `reconcile` run-root loop, `ownerKeeps`, `dropUnowned`, ownTemps branch, src/verify.ts callers, read 2026-11-20 · the refusal path already keeps a run root with `refusal.json`; any `keep()` or `ownerKeeps` entry blocks leaf temp release · set the marker shape and the no-veto rule.
- Charting observation (A), 2026-11-20T11:12:03Z, akrogon release 5daa962e, local user ivan, no credentials: `akrogon run-check --name repro145 --holder <scratchpad>/holder -- sh -c 'mkdir -p "$TMPDIR/evidence" && echo kept > "$TMPDIR/evidence/f" && echo "kept at $TMPDIR/evidence"; exit 3'` printed `kept at /var/tmp/akr-1000/5d20/07a5c53f/run-JFqlar/evidence`, exit 3; `ls` of the run root right after: No such file or directory. Cleanup: the holder folder in the scratchpad only. Limits: proves today's red-exit removal, not reconcile behavior or a killed wrapper.
- Disk probe (B, rebuttal D2), 2026-11-20: `du -sm /var/tmp/akr-1000/*/*/run-*` largest live run root 18 MB, largest leaf temp 76 MB; `df /var/tmp` 680 GB free.
- Charting observation (A), 2026-11-20T11:19:55Z, akrogon 5daa962e, bun 1.4.5, local user ivan: `bun test --timeout=30000 tests/run-check.test.ts tests/reconcile.test.ts tests/verify.test.ts -t "fresh run root under the leaf temp|unfinished leaf temp is removed once its tab is gone|run root with a dead owner pid|verify removes each command TMPDIR"` 4 pass, 0 fail. Limits: today's behavior only.
- Leaf review (slots/leaf-review-b.md, slots/leaf-review-c.md): B D1 marker decided after the late refusal and `check_end`, B D2 child-deleted TMPDIR criterion, B D3 self-update note, C verbatim-block and link fixes; all applied to the draft with slot tags.

## Taken

A's pick under full autopilot, 2026-11-20, not operator words: 1a 2a 3a 4a 5a, built as slots/kept-run-root-final-shape.md:

1. `checkedRun` (src/run-check.ts): when the command exits nonzero and the run was not refused, write an empty `.akrogon-kept` file in the run root and skip the final `rmSync(runRoot)`. `.owner` stays as written. A thrown error, a refusal and a zero exit behave as today.
2. `reconcile` (src/reconcile.ts) run-root loop: after the `refusal.json` check, a root holding `.akrogon-kept` is skipped with no `keep` and no `drop`, before any `.owner` read. `ownerKeeps`: a `run-*` directory holding `.akrogon-kept` returns no entry and is not recursed into, checked before its `.owner`.
3. Every `checkedRun` caller (run-check and verify), no parameter.
4. Lifetime: the leaf temp's existing release; `checkout`/`self-update` holder runs until the existing idle `dropUnowned` sweep, no timer.
5. Silent: no new stderr, status or leftovers output.
6. Docs: docs/reference/checks.md (private TMPDIR sentence) and src/AREA.md run-check and reconcile lines state that a red run's TMPDIR is kept until the leaf temp is released, a holder run's until the idle sweep.
7. Lessons: both LESSONS.md lines stay, because a killed wrapper and the holder idle sweep still lose evidence (lesson rule Retire clause); rewording is /learn-issues work after landing.

Reasons: signpost 1 (fewest parts) decides 2a, 3a, 5a; signpost 2 (no veto, no timer) decides 4a; the 2026-10-10 operator answer (crashed run roots are removed) decides 1a over 1b. B D1 removed the `.owner` deletion: both readers check the marker first, so a stale pid is never read.

Rejected: 1b (contradicts the 2026-10-10 answer, keeps every killed green run); 2b (one more condition for tidiness only); 3b (a mode flag on a shared function to save tens of MB, B's probe); 4b (a second silent rule with a clock); 5b (the child's printed path is the reader's route); C's chmod guard (today's `rmSync` has the same exposure; not a new failure).

Standing consultant dissent (C): 2b, 3b, 4b and the chmod guard.

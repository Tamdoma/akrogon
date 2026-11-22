# Merged notes: kept-run-root (A, B, C)

Blind notes: the map returns slots/map-A.md, slots/map-b.md, slots/map-c.md, written independently against the same intake and signposts, answer these questions with pick, rejected options, evidence and pitfalls.

## Charting observation (A)

2026-11-20T11:12:03Z, akrogon release 5daa962e: `akrogon run-check --name repro145 --holder <scratchpad>/holder -- sh -c 'mkdir -p "$TMPDIR/evidence" && echo kept > "$TMPDIR/evidence/f" && echo "kept at $TMPDIR/evidence"; exit 3'` printed `kept at /var/tmp/akr-1000/5d20/07a5c53f/run-JFqlar/evidence`, exit 3; `ls` of that run root right after: No such file or directory. Reproduces #145 for free.

## Q1 How does a red run's root survive reconcile?

- Marker file in the run root, written before `.owner` is removed; reconcile's run-root loop skips a marked root with no `keep` and no `drop`; `ownerKeeps` returns no veto for a marked `run-*` root and does not recurse into it (B,C; A adopts after the merge). Reason: copies the refusal shape, no shared type touched, no pid-reuse veto, a killed run's crash cleanup stays as the 2026-10-10 operator answer set it ("The reconciler removes run roots whose process is gone"). Cost: one file kind, one branch in each of two functions.
- `.owner` field `kept` (B,C reject): widens `ownerSchema` shared with `batch-*.owner`.
- No marker, reconcile stops dropping dead-owner roots (A's map pick, withdrawn): contradicts the 2026-10-10 operator answer and keeps every killed green run until release (B K1c, C 2c).
- Marker name: akrogon-specific dotted name so a child's own file cannot collide (B); `.kept` (C).

## Q2 What triggers the keep?

- Nonzero exit, not refused, contents not inspected (A,B). Reason: fewest parts (signpost 1). Cost: empty `run-*` folders from red lint or typecheck runs until release.
- Nonzero exit and the root holds something besides `.owner` (C). Reason: no empty-folder clutter. Cost: one directory read and a second condition.
- Thrown errors (spawn ENOENT, lock failure) still remove the root (B), so `run-check preserves failed executable errors and removes their capture directories` stays green.

## Q3 Which callers?

- Every `checkedRun` caller, no parameter (A,B). Reason: one rule, no mode flag. Cost: a red `verify` member or a `--known-red` base run keeps its temp until leaf release; `tests/verify.test.ts` `verify removes each command TMPDIR on success and failure` flips.
- `run-check` only, boolean parameter from `runCheck` (C). Reason: verify's red temp has no reader (a red merge check is reproduced with a narrower run-check) and full suites can be large. Cost: a mode flag on a shared function.

## Q4 How long does a kept root live?

- Until the leaf temp's existing release (tab and panes gone; failed leaves keep their tab) (A,B,C). `checkout`/`self-update` holder runs: until the existing idle `dropUnowned` sweep (A,B); add a 60-minute age window for marked roots there (C).
- Per-check-name replacement, earlier kept roots removed at a red exit, unless a `du` probe shows red roots are small (B). A and C: no bound before release.

## Q5 Does run-check announce the keep?

- Silent: the child's own printed path now stays valid; no stderr, `status` or `leftovers` change (B,C; A adopts). A's map proposed one stderr line; withdrawn, since the reported reader follows the child's line.

## Pitfalls and what removes each

- Kept root vetoes leaf temp release or shows a `Kept:` line: no `keep()` in the loop and no `ownerKeeps` veto for marked roots; a test asserts release on tab gone with a marked root inside and no kept entry (A,B,C).
- Pid reuse on a stale `.owner`: `.owner` removed after the marker is written (A,C).
- Marker/owner race with a concurrent reconcile: marker first, then `.owner` removal (C).
- Refusal collision: marker only on `!refused`; reconcile checks `refusal.json` first (A,C).
- Killed wrapper (seat timeout, SIGKILL): `finally` never runs, no marker, reconcile drops it as today. Not covered (signpost 1). Consequence (A, after merge): the lesson rule's Retire clause keeps both LESSONS.md lines, since the mechanism is not stopped on every reachable path; no retirement criterion and no prerequisite on the uncommitted 2026-11-20 lesson files. B R1: the lesson stays with its explicit-evidence-root advice for bounded paid runs.
- Docs drift: `docs/reference/checks.md` ("a private `TMPDIR`") and `src/AREA.md` reconcile line state the kept red root (B).
- Mixed versions: an older reconcile drops an ownerless marked root after 60s when idle, never pins it (C).

## Where slots differ

- Q2: A,B nonzero only; C nonzero and non-empty.
- Q3: A,B all callers; C run-check only.
- Q4: B per-name bound pending a probe; C 60-minute holder window; A neither.

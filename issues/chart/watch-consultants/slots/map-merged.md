# Territory map, merged (A, B, C)

## Forks

1. consult-loop — how one consult runs:
   - Trigger and grouping: which failures start a consult and how failures sharing one cause become one consult. Watch's model choice with recorded reason, no text match (A); provisional group confirmed by the peers against failing command, revision and cause, reopened if a leaf stays red after the fix (B Q1); cluster same-tick or consult merge-queue head first then re-observe (C 3). A merge base red moves to `check.fix`, not `failed` (merge-issue Shared endings), so a trigger on `failed` alone misses the Bun case's repeats (C practitioner).
   - Exchange: brief and return files outside `issues/` (A F3, C 8, B Q6); the first ask over `hc send` too (B Q2); literal watcher address (C 5); late reply matched to its case (B Q2).
   - Wait and delivery: in-turn `hc wait --children any` loop with check-ins (A F7, C 4a) vs end turn (C 4b, against S4 reading). Message delivery into a working watcher may arrive as next input rather than wait stdout (C pitfall, `hc --skill`); needs observation per watcher harness (B A2, C ext 2). Never `hc get` the consultant between waits (C, questions.md).
   - Liveness: nudge once on silent stop; second silent stop, error or exit replaces the consultant (A F7, B Q9, C 4).
   - Loop end with no total cap: same failure recurring after a consult with no new progress stops consulting and notifies (C 3, C pitfall); peer disagreement resolution (C 5, B Q9).
   - Queued ticks: drain each due vs coalesce (B Q9, C 4 i/ii); timer change would touch timer.ts.
   - Record: durable per-consult record outside git, e.g. `~/.akrogon/watch/<repo>/consults/` (A F3, B Q6, C 8a); never rows in `issues/log.jsonl` (C: `src/log.ts` `readLog` parses every line with `logSchema`).
2. fix-and-resume — what a fix may touch and how leaves resume:
   - Base fix: clean disposable worktree on `<remote>/<default_branch>`, configured checks green, fast-forward push only (A F5, B Q3, C 6a); never edit `repo.root` (C).
   - Leaf-local fix: through the leaf's own seats and lifecycle (A F5), or a consultant commit in the idle owner's worktree (B Q3, C 6 ii) with `moveGuards` trailers and receipts.
   - Resume: `akrogon phase <slug> <failure.phase>` + `next` once the fix is reachable on the target (A, B Q4, C 6i); stale `batch` on a recovered merge leaf needs observation (C practitioner, C ext 5).
   - Never list: kill/rm own verified consultant; exchange with it; "Answer a seat", `--force`, `phase failed`, `.env`, `issues/` edits stay (A F6, C 7a, B Q5).
   - S3 pre-filter: notify at once on a plain S3 reason vs consult to look for an S3-free route (C 7).
3. config-and-naming — recipe, start, cleanup:
   - Key: top-level `consultant:` (A), `slots.consultant` (B Q7, C 1a); optional; surfaced in `effectiveConfig` (C); chart door's explicit flags untouched (B, C).
   - Absent recipe: loud error and notify-only (A, C 1 i), or refuse watch start (C 1 ii).
   - Name and labels: `<prefix>-watch-consult` plus label (A F2, C 2a, B Q8); `consultantName` collides with chart doors since hc names are unique among live terminals (`hc run --help`).
   - Cleanup: watch closes after each case; `stop.ts` sweeps verified consultant; watcher exit kills it (`outlive: false`) (A, B Q8, C 2).

## Pitfalls (merged)

- Name collision with chart doors (A, B, C).
- Infinite consult loop with no cap (C).
- Message delivered as next input, not seen by the waiting turn (C).
- `issues/log.jsonl` schema crash from foreign rows (C).
- Dirtying `repo.root` or a leaf's live worktree (B, C).
- `moveGuards` refusals after consultant commits (C).
- Tick bursts after a long consult (B, C).
- Push racing a merge turn: fast-forward only, retest after remote advance (A, B).
- Stop mid-consult: watcher must see the stop and not report an error (C).

## External operations needing observation (A, B A1-A5, C 1-5)

Consultant launch from a watching terminal with a non-colliding name (agy neon high start proof); `hc send` to a working watcher and `hc wait --children any` wake semantics per watcher harness; timer due delivery across a long consult; `hc kill`/`hc rm` of the consultant and `stop.ts` sweep; fast-forward push to a throwaway remote; `akrogon phase` + `next` recovery of a failed merge leaf holding a `batch`.

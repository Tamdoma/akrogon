# Review A: leaf-stop (check.review, initial, blind)

Base `e5776ade920e619e923a7825140f823c2e89123e`, reviewed head `6fe00fa`. Debate: no.

## Verification evidence
- Checks from implement on `c1dde6b`: format rc 0, typecheck rc 0, test rc 0 (887 tests, 0 fail), test_changed rc 0 (144 tests). `6fe00fa` changes only README.md and docs/guide/next.md, and command-reference plus docs-links passed on it (9 pass). No code change since, so no rerun.
- AREA listing: every backticked `src/`, `tests/`, `docs/`, `skills/`, `plugin/` path in src/AREA.md and tests/AREA.md exists (43 ok, 0 missing). Both files are 40 lines.
- Docs: docs/guide/next.md "Stopping a leaf" and the README rows match the code, except as F2 affects "every allocated leaf".
- Scratch scenario for F1 (temporary test file, deleted after the run): two merge leaves `aa` (holder) and `bb`, then `next`, then `stop aa`, then `next`, then `start aa`. Output:
  - after first `next`: `aa` batch applied, members `[bb]`, prompt `merge-issue aa`.
  - after `stop aa` + `next`: `aa` batch still applied with members `[bb]`, and `bb` now has its own applied batch (members `[]`), prompt `merge-issue bb`.
  - after `start aa`: `aa` batch attempt `7e903841…` with members `[bb]`, and `bb` batch attempt `031702b4…`. Two applied batches both carry `bb`.
- Read-only count for F2, in the registered akrogon checkout with the leaf's own `allLeaves` filter (`state.tab !== undefined`): `targets 164 closed 161 merged 163`. The open targets are `run-permit:merged seat-containment:merged leaf-stop:check.review`.

## Fixes

### F1 Stopping the merge holder splits the single merge turn
- Source: the operator runs `akrogon stop <leaf>` on the leaf holding its repo's merge turn while its merge seat runs the merge checks. That is the incident case this leaf exists for, since heavy test runs happen at merge. Traced through `mergeQueue` (src/turn.ts:83-87): the stopped holder is dropped from `eligible`, so `mergeTurn` (src/next.ts:1097) picks the next merge leaf as holder and builds a new stack. The stopped holder's applied `batch` record, which carries that same leaf as a member with its branch moved to the stacked tip, stays in place.
- Consequence today: two applied batches claim the same member (scratch output above). After `akrogon start aa`, aa's merge seat is prompted with a stack top that contains bb's commits, while bb's own merge seat may already have landed or still be landing bb. The repo's one-holder merge turn (docs/guide/next.md "How order is decided") is broken, so double landing or reset member branches can follow. This is a concurrency defect.
- Hits: criterion 2's merge clause ("the merge path starts no stack or merge seat for it") holds only for the stopped leaf. The plan's D6 ("one filter covers every caller") misses the batch-holder case. No test covers stopping a leaf that holds an applied batch.
- Smallest correction (plan D6 change, so A's): a stopped leaf that holds a `batch` keeps its place in the queue, so the turn waits for `start`, and the merge path neither builds a new stack for it nor prompts its seat (D5 already ends `dispatchMergeLeaf` quietly). Also gate the "restore then build" path in `mergeTurn`, where an unapplied stopped holder would otherwise get a fresh batch. Then add a reproduction test: stop the holder of an applied batch, run `next`, and expect no new batch and no prompt for any leaf.

### F2 `stop --all` targets every closed and merged leaf
- Source: real content. In this repo, `allLeaves` scans `issues/open` and `issues/closed`, and closed leaves keep `tab:` after merge. Read-only count above: `akrogon stop --all` run here would target 164 leaves, 163 of them merged and only 1 live (`leaf-stop`).
- Consequence today:
  - 163 stale `stopped.yaml` records and 163 `systemctl --user stop` calls, with 164 output lines for one live leaf.
  - The two open merged leaves awaiting cleanup (`run-permit`, `seat-containment`) become stopped. The D5 gate runs before `completeOwner` in `dispatchLeaf`, so their completion cleanup never runs on automatic passes, and every typed `next`/`next --all` errors on them until each is started by hand.
  - Closed leaves' records never clear, so a later leaf reusing a slug starts out stopped.
- Hits: criterion 4 ("stops every allocated leaf of the current repo"). A merged or closed leaf is not allocated. `tests/leaf-stop.test.ts` `stop --all…` has no merged or closed leaf with a tab, so it cannot catch this.
- Smallest correction: `--all` selects open, unmerged leaves with a tab (`issues/open`, `phase !== 'merged'`). Add a case with a merged leaf that keeps its tab and expect no record and no systemctl call for it.

## Nits
- N1 Stop waits behind a pass that holds the global lock. In the live run, `akrogon stop` took 99.7 s while the slice stop took 18 ms (report "Known limitations"). The design requires the record to be written under the lock, and a pass is bounded by its timeouts. Deferred because no criterion bounds the time. Evidence that would promote it: a real pass holding the lock long enough that the stop misses the incident's need, such as a merge-seat delivery stuck for minutes.
- N2 A carried member that is stopped after its holder's batch was applied still lands through the holder's batch. Its own seat is never prompted, and nothing new starts "for it", so criterion 2 holds. Deferred, with no realistic source shown. Evidence that would promote it: an operator stopping a carried member to keep it from landing.
- N3 The status mark sits in the NOTE column and could be truncated on narrow terminals. Wording only, and no failure today.

## Verdict
fix

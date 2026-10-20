# Notes A: equality-rule

Code at akrogon HEAD 96a96979, read 2026-10-19.

## Pick
The check stays in `integrate` (`src/sync.ts`), shared by `syncCommand` and self-update, because both move routes overwrite ignored files silently (map: B,C probes of `rebase --autostash` and `read-tree -m -u`). An ignored path stops being a collision only when all hold: the incoming tree has an entry at that exact path; the local path and that entry are the same type and mode (regular 100644 or 100755 by the local executable bit, or symlink 120000 with the same target); the raw local bytes hash to the incoming blob (`git hash-object --no-filters`, so a filter or line-ending difference stays a refusal); and no replayed local commit (`incoming..HEAD`) touches the path. Every other case keeps today's refusal: differing bytes, mode or type, an ignored file where a directory is incoming or the reverse, a gitlink, a replayed path.
One comparator: `moveCheckout` in `src/self-update.ts` already has an "equal collider" loop (`hash-object` vs `rev-parse <target>:<path>`, filters on, no mode). Extract one predicate "local path equals target entry" and use it in both places, so the repo has one meaning of identical.
Reason: smallest change that removes the false refusal while keeping the guard; one comparator instead of two.
Cost: a per-path hash for each ignored path inside the incoming tree (28 in the report); `moveCheckout`'s collider rule becomes stricter (mode, no filters), which could turn a move it accepts today into pending.

## Rejected
- Drop the ignored check and rely on Git (map C option): Git overwrites differing ignored files silently, losing operator bytes.
- Compare in each move route separately: two comparators that drift; integrate already runs before both.
- Bytes only, ignore mode and type: a symlink or executable bit change is lost silently on move.
- `hash-object` with filters (today's moveCheckout form): a clean filter can map different local bytes to the same blob, and checkout then rewrites the file.
- Auto-delete identical ignored files before the move: same result, more mutation; the move already writes the same bytes.

## Evidence (tier: code, 2026-10-19)
- `src/sync.ts` `integrate`: ignored list from `ls-files --others --ignored --exclude-standard`; collision when the path, an ancestor or a descendant directory is in incoming tree paths plus replayed paths; no content check.
- `src/self-update.ts` `moveCheckout`: `read-tree -m -u head moveTo`; on refusal adopts index only when every changed path is a dirty collider whose `hash-object` equals `rev-parse moveTo:path`.
- `tests/sync.test.ts`: "sync preserves ignored ... against ..." matrix pins refusal and kept bytes; "sync permits harmless ignored paths" pins non-colliding ignored paths.
- #106: 28 ignored files, `cmp` same=28 diff=0 against origin/main blobs, under ignored `.spec/` force-tracked by a merged commit.

## Pitfalls
- Identical file under a replayed local commit: the rebased tree may differ from incoming; removed by keeping replayed paths as collisions.
- Directory/file swap with identical leaves: only exact-path file entries are exempt; ancestors and descendants still collide.
- Large ignored trees: hash only ignored paths that are exact incoming entries, not every ignored file.
- Stricter shared comparator changes moveCheckout: decide explicitly whether moveCheckout adopts it.

## Question the fork does not ask
- Should moveCheckout's existing equal-collider rule switch to the same strict predicate (mode, no filters), or keep its current form?

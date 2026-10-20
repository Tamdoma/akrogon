# Brief: identical-ignored

## What

The shared ignored-path guard in `integrate` (`src/sync.ts`), which runs before both `akrogon sync` and self-update move the operator checkout, stops treating an ignored local path as a collision when it is already the same file the move will write: the path is an exact incoming tree entry of type blob, the local path has the same type and executable bit (regular file 100644 or 100755 by the owner executable bit, or symlink 120000 with the same link target, read without following the link), its raw bytes hash to the incoming blob id (`git hash-object --no-filters`), and its only overlap is that exact incoming entry: it is not a replayed path (`incoming..HEAD`), no ancestor of it is a replayed path, and it is no directory of an incoming or replayed path (B,C). Every other overlap keeps today's refusal and message.

## Why

In the framework checkout (#106) sync refused on every run over 28 ignored files under `.spec/` that were byte-identical to blobs a merged leaf had force-tracked; the operator had to remove them by hand. Both move routes (`git rebase --autostash` and `git read-tree -m -u`) silently overwrite a differing ignored file, so the guard must stay; only the identical case is a false refusal.

## Done-criteria

1. Red first: `akrogon sync` and a behind-only self-update move succeed when an ignored local path equals an incoming tracked entry as a regular file, as an executable file, and as a symlink with the same target; afterwards the path is tracked at the incoming blob and mode and, with no checkout conversion configured for it, its bytes are unchanged (B).
2. `akrogon sync` still refuses, with the operator bytes, checkout and records unchanged, when the ignored path differs from the incoming entry only in bytes, only in line endings (CRLF local, LF incoming, under a `text` attribute), only in executable bit (both directions), or only in type (file against symlink, both directions).
3. `akrogon sync` still refuses an ignored path equal to the incoming entry when replayed local commits touch that path, an ancestor of it, or a path under it (an equal `collision` with replayed `collision/file`, an equal `collision/file` with replayed `collision`), with checkout and records unchanged (B,C).
4. A sync with one equal and one differing ignored path refuses, names only the differing path, and leaves checkout, index and records unchanged.

# Slot D review of wake-cost, round 5

**Verdict `fix`** for `ab5278b7` on `814a2387`.

## Findings

- **F14 · `src/timing.ts:176–186`**. The existence check discards held rows on some I/O errors. I primed a capacity wait through a symlinked timing log, then removed search permission from the target directory. A direct stat returned `EACCES`. The wake reader returned an empty queue and emitted no warning. Handle true absence separately and preserve held rows on other read failures.
- **F15 · `src/timing.ts:157–167, 229–231`**. Replacing the log can suppress a real wait write. I primed the cache with a wait for `queued`, then atomically replaced the file with a same-sized log on a different inode containing only `otherx`. Calling `recordWait` for `queued` did nothing because the cache still held the old row. A full read confirmed only `otherx` was on disk, so a fresh wake could still miss `queued`. Rebuild the cache when the opened file's identity changes.
- **F16 · `src/timing.ts:134–154, 176–193`**. The fresh-process reader misses the 100 ms per-pass target across the unpaused repos. Five runs on copies of all 11 logs, 41.35 MB total, took 140–157 ms with a 155 ms median. Repeated reads averaged 0.076–0.116 ms per pass. The cold reader parses kept rows twice and uses a schema check to get every row's kind. Parse each row once and measure the full set again.

## Re-check

- The single-release redesign removes the state cache and carries no wait fields across rollback. The escaped and whitespace slug, malformed neighboring row, first-visit, whole-line append and shorter-file tests passed.
- With two queued leaves, I manually seated the newer one on the new head, removed its terminal and woke on the base. The base read the new prompt row and resumed that leaf first. A manual seat executed on the base still has the base's original behavior.
- F2's dependent dispatch remains under the global lock. The focused suite covered closed-worktree config, closed dependency dispatch and broadcast. The landed wake still explicitly finds closed merged leaves. The separate `red-records.jsonl` deletion remains the landing step identified in the brief.

All 352 focused tests passed across seven files. Typecheck and `git diff --check 814a2387..ab5278b7` passed. The supplied full Verify log records 1,380 passing tests.

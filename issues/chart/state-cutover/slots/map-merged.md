# Map merged + proposed final shape (A, 2026-10-16)

## Agreement
- (A,B,C) The cwd test is the false-positive class: shells, chart sessions and helpers in the root write no state. Replace `foreignProcess` with a scan for processes that actually execute the tool root's akrogon code. Keep live-record deferral, the tool-root global lock plus slice locks, the copy-then-recheck order and config-last publication (src/state-home.ts:118-160).
- (A,B,C) Identify by what the process executes: an argv entry that, resolved against that process's cwd with symlinks followed, lands inside the tool root (`bun ~/.local/bin/akrogon ...`, `bun src/akrogon.ts` from the root). Arbitrary text that merely mentions the root path does not count (B F5).
- (B) Do not exempt ancestors; exempt only this process and its own descendants (B F4). An old akrogon parent defers migration; the next command retries.
- (C) Only processes whose code predates the cutover matter: a process running the tool root's code that started after `src/state-home.ts` in the tool root was last written already runs `migrateStateHome` at start and resolves `globalHome()` per call (src/config.ts:197-202), and its writes go through the locks and live records the migrator already holds or counts. Without this filter, any routine `akrogon next` waiting on the lock defers the move and the gate only opens in lucky gaps (C, measured two `akrogon next` waiting on the flock). A later rewrite of `state-home.ts` refreshes the mtime and only makes the gate more cautious.
- (C) Processes running another tree's code (a leaf worktree, tests with `AKROGON_HOME`) are not tool-root writers and do not count, because their argv resolves outside the tool root.
- (B P3, C) A same-uid process whose cmdline or cwd cannot be read, and that has not vanished, defers with a reason; other users' processes are skipped.
- (B) Deferral prints which pid blocks, on stderr, once per command.

## Proposed final shape
1. `settled()` = no live tool-root run record, and no same-uid process other than this one and its descendants that (a) has an argv entry resolving, against its own cwd and through symlinks, to a path inside the tool root, and (b) started before the tool root's `src/state-home.ts` mtime. Cwd alone never counts.
2. An unreadable same-uid process that still exists defers.
3. A deferral prints one stderr line naming the blocking pid and its argv.
4. Unchanged: locks, copy, recheck, config-last, relative-repo rewrite, AKROGON_HOME override.
5. Tests: a cwd-only holder no longer defers (replaces tests/state-home.test.ts:144); an old-shaped akrogon process (symlinked entry, started before the mtime) defers; the same started after the mtime does not; a process running another tree's akrogon does not.
6. Route: direct (door implements in a worktree, B reviews, lands); then the door verifies the move on this host (`~/.akrogon/config.yaml` present, one command using it, no new tool-root state writes) before release-deploy can ship, and then runs the run-release Pending step.

## Open points
- (B Q1/O3) A controlled window is the fallback if the host still allows legacy launches; after this lands, every akrogon launch on this host goes through `~/.local/bin/akrogon` → tool root, so no independent legacy entry exists.
- (C last question) A new-code long run whose record path was captured before the flip: counted by `liveRecords`, so the move waits for it.

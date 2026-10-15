# Design: close-pack

## Binding decisions, verbatim

### Evidence location
From [evidence-location.md](../../../chart/check-evidence/forks/evidence-location.md).

Operator, 2026-10-15: Q2 `2a`; Q1 first reopened with "What does zip like mean? The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read.", then `1a`.

Reason: keep history small; logs stay readable whenever they are referred to; plain logs of an open owner living on one host for a few hours is accepted.

Foreclosed: one compressed file per log in the repo; a host store outside the repo (no backup besides GitHub, other clones hold dead pointers); leaf temp reaped at leaf end; committing plain logs until the archive replaces them.

Final shape, verbatim:
  1. While an owner is open, run-check writes plain logs as today (src/run-check.ts:207-209).
  2. `.gitignore` gets `issues/open/**/*.log` and `issues/parked/**/*.log` through the `akrogon init` additions (src/init.ts:67-76), so sync never adds a new plain log, including after `akrogon park` (src/park.ts:68) (A,B,C,D). Logs already tracked stay tracked until existing-backlog decides (B,C). Chart direct logs belong to log-coverage (B,C,D).
  3. completeOwner, at the final `complete` gate before the rename (src/phase.ts:221-224), writes `<owner>/.closing`, then packs every `*.log` on disk under the owner into `<owner>/evidence.tar.zst` with members relative to the owner folder, built from files on disk, never from timings or receipts (C). Write to a temp name, read every member back byte-equal, rename into place, delete each plain log only once its exact bytes are in the verified archive, then rename the owner (A,B,C,D). A retry merges the archive's members with any plain log present, never fewer (B,C,D). An owner with no logs gets no archive (D). Symlinked logs are refused (C).
  4. run-check refuses a target under `issues/closed/` or under an owner holding `.closing`, both at start and again right before it publishes (src/run-check.ts:207) (B,C,D). Explicit holders under `issues/chart/` stay allowed (B,C,D). A refused publish exits non-zero naming the captured out.log and does not delete its run dir (B).
  7. Pack and read with `Bun.Archive` plus `Bun.zstdCompressSync` level 19 and `Bun.zstdDecompressSync`, no new dependency and no child process (B,D). Probe, A 2026-10-15, Bun 1.4.3: a 174-char member name and bytes 0,1,10,13,128,255 round-tripped byte-equal, and GNU tar 1.35 `tar -I zstd -xOf` read the same file. Reads hold the whole owner in memory, 148 MB for the largest owner today (C): accepted.
  9. A failed leaf that never closes keeps its plain logs on this host, uncommitted.


Excluded here: items 5, 6 and 8 (the `akrogon log` command, flaky and reader skill lines) belong to [log-reader](../log-reader/brief.md). Item 1 needs no change in this leaf: run-check keeps writing plain logs. Item 9 needs no code: it follows from item 2's ignore lines.

### Log coverage
From [log-coverage.md](../../../chart/check-evidence/forks/log-coverage.md).

Operator, 2026-10-15: `1a | 2a | 3a`. Chart direct logs are packed when the chart ends, by one command the door runs, with a status warning for an ended chart holding loose logs. Every kept command output goes through `akrogon run-check`, which prints the saved path; skills stop telling seats to copy logs. No guard against stray logs; the close-time pack takes them.

Reason: every log has one writer and one naming rule, and every folder ends clean (operator, worktree-cleanup: "I want all folders to be clean of junk and leftover files").

Foreclosed: committing chart direct logs plain; ignoring them and keeping them on this host only; a hook in chart-usage.ts plus a sync pass as the trigger; allowing purposeful hand-saved extra logs; a filename or duplicate-content guard at phase moves.

Final shape, verbatim:
  1. The pack is one shared function used by completeOwner and by a new command `akrogon pack <chart>`, which packs only `<chart>/direct` (B). The log set is every `*.log` under the folder, recursive, dotfiles included, the same set for pack, status warning and ignore (C).
  2. `.closing`: completeOwner writes it before packing and keeps it through the rename, removing it after the move (B). `akrogon pack` writes it and removes it on success; a failed pack leaves it and exits non-zero naming it, and rerunning the pack finishes and removes it (B,C).
  4. `.gitignore` additions from `akrogon init` (src/init.ts:67-76) cover `issues/chart/*/direct/**/*.log`.

This leaf owns the shared pack function and the completeOwner half of items 1 and 2, and item 4's ignore line. The `akrogon pack <chart>` command and its `.closing` handling (items 1 and 2), the door's pack step (item 3) and the status warning (item 6) belong to [folder-pack](../folder-pack/brief.md); item 5 belongs to log-reader; items 7-9 belong to [check-path-print](../check-path-print/brief.md).

### Existing backlog
From [existing-backlog.md](../../../chart/check-evidence/forks/existing-backlog.md).

Operator, 2026-10-15: `1a | 2a`. Migrate the old logs once with the same pack, akrogon first then framework; delete the 9 slots scraps in the akrogon run.

Reason: one lossless pack path for new and old logs; history rewrite is out.

Foreclosed: removing the old logs from the tree; leaving them; a one-time migrate verb removed later; a broad sync commit for the migration; keeping the slots scraps.

Final shape, verbatim:
  2. Packing a closed owner uses the shared pack: every `*.log` under it on disk, recursive, dotfiles included, tracked or not; retry union; `.closing` while it runs, removed on success.
  3. Verification reads every member back through the same resolver `akrogon log` uses, by its original path, and compares it with the source bytes before deleting that plain file, so a member-naming error fails before any delete (C).

This leaf delivers the shared pack and its read-back verification (items 2 and 3) as used by completeOwner. Folder-pack owns the closed-owner and chart entry (item 1), the tracked-log checks (item 4), the multi-folder call (item 5) and the status list (item 6). Items 7-8 are the chart door's step on main.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: each done-criterion is proven by the cheapest test at the real boundary, here an `akrogon` invocation or exported function over a temporary repo and temporary `AKROGON_HOME`/`HOME` with the existing test helpers (tests/helpers.ts). No bug fix is in scope. New behaviour shows one deliberate break turning its test red. No new test machinery: no runner, pool or fixture factory is built. No live model or outside call is part of any criterion, and no live run. Secrets, auth and UI lines of the standing design do not apply.

## Leaf architecture

Owned surfaces:
- A shared pack function exported from one module (for example `src/pack.ts`): `packFolder(repo, folder)` takes an absolute folder at the registered root and the root of member names (the owner folder, or `<chart>/direct` for folder-pack), lists every `*.log` under it recursively from disk (dotfiles included, symlinks refused with an error naming the link, `evidence.tar.zst` itself never a member), merges with any existing archive's members (plain file wins only when the archive lacks that member; a member present in both with different bytes is an error naming it), writes `evidence.tar.zst.tmp`, reads every member of the temp file back and compares bytes (evidence-location item 3), renames it over `evidence.tar.zst`, reads every member again from `evidence.tar.zst` through the log-reader resolver, mapping each original path with `locate` and reading it with `readMember`, never the plain file (existing-backlog item 3), then deletes each plain log whose bytes matched both reads. No logs and no existing archive writes nothing. A member present in both the archive and a plain file with different bytes stops the pack before any write (C). Compression is `Bun.zstdCompressSync` level 19 over `Bun.Archive` bytes, no child process. Open for the plan: the exact signature.
- `completeOwner` in src/phase.ts: after the `complete` gate and the destination-exists check, writes `<owner>/.closing`, calls the pack, renames the owner to `issues/closed/<owner>`, then removes `issues/closed/<owner>/.closing`.
- `checkedRun` in src/run-check.ts: refuses a `target` under `issues/closed/` or under an owner folder holding `.closing` at start (before admission) and again right before `mkdirSync(target)`/`copyFileSync`. The late check re-resolves the owner against the registered root's current state: the owner folder missing from `issues/open/`, or present under `issues/closed/`, is refused even though the captured target still spells `issues/open/...`, and no `mkdirSync` runs (B). The late refusal throws a specific error naming `out.log` and skips the `finally` removal of the run folder. A target under `issues/chart/` is not refused. Open for the plan: how "owner folder" is found from `target` (`implementation/` sits under the leaf, the leaf under the issue, the issue maybe under an epic).
- Scratch reconcile in src/reconcile.ts removes every run folder whose `.owner` process is dead and keeps, with a reason, one with no `.owner` record. A refused capture must survive it and be reported as kept (B). Open for the plan: the marker (for example replacing `.owner` with a refusal record) and the reported reason.
- `eligibleRecord` in src/sync.ts also excludes basename `.closing` and names ending `.tar.zst.tmp`, beside the existing `.lock` exclusion (C).
- `init` in src/init.ts: the `additions` list gains the three ignore lines.

Consumers of the changed state:
- `transition` in src/phase.ts calls `completeOwner` after the merged move is committed and wraps a failure in `MoveCommittedError`. The retry path is `akrogon next <slug>` on a merged leaf (src/next.ts, the `state.phase === 'merged'` branch, which returns `completed`); `akrogon phase <slug> merged` also reaches `completeOwner` (src/phase.ts) but then fails in `transition` with `Merged is terminal`, so no criterion uses it as the retry (B,C). A pack failure or symlink refusal must surface there and be retryable, which criterion 2 proves.
- src/reconcile.ts mirrors completeOwner's move prediction; packing does not change whether the owner moves, so it needs no change. Open for the plan: confirm.
- `akrogon sync` (src/sync.ts) stages all eligible `issues/` changes: it commits the new archive and the deletion of any tracked plain log, and after this leaf never a `.closing` or a pack temp file (C).
- `flaky` and `akrogon log` read through the log-reader resolver and need nothing further.

Held disagreement (B): B asks that run-check also refuse a `<chart>/direct` holder while it holds `.closing`. Kept as decided, because evidence-location Taken item 4 says explicit holders under `issues/chart/` stay allowed, and a log written during a chart pack loses nothing: the pack deletes only files it verified, and the new plain log stays for status to list and the next pack to take. A change needs a new operator decision.

Exclusions: the resolver and `akrogon log` (log-reader); `akrogon pack`, tracked-log checks, status listing and the door's chart-end step (folder-pack); run-check's stderr path line (check-path-print). No edit under `issues/`; running `akrogon init` on akrogon's own checkout is the door's migration step.

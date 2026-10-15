# Merged notes: existing-backlog Q1

## Options
- O1. Migrate once with the same pack: closed owners and ended charts' `direct/` become `evidence.tar.zst`, plain logs leave the tree in a forward commit, no history rewrite (A,B,C). Reason: closed owners are 943.15 of 944.9 MiB in framework (C); the taken resolver and flaky already read archives (A,B,C). Cost: a migration entry point in the akrogon leaf, then a per-repo run on each main checkout after the new akrogon is installed, akrogon first, framework second (A,B,C). Pack and clone download do not shrink; framework adds about 23 MiB of archive blobs; the checkout drops about 921 MiB (C). GitHub web view and `git grep` stop seeing old log text (C).
  - Entry point: a bounded one-time migration that calls the shared pack for closed owners without replaying completion (B); let the pack run on a closed owner folder, or a migrate verb looping closed owners (C); A asks whether a one-time command leaves dead code.
- O2. Remove from the tree without archives (none). Rejected: evidence only in history, no reader reaches it, flaky prints `(log gone)`, cited paths dead (A,B,C).
- O3. Leave (none). Rejected: 944.9 MiB stays in every framework checkout forever; two closed-evidence forms with no rule (A,B,C).
- O4. Migrate only large owners (none). Rejected: a permanent threshold rule (C).

## Evidence
- Tracked logs at HEAD: akrogon 743 (closed 694 in 27 owners, open 4, chart direct 36 in 4 charts, other 9); framework 4,462 under issues/ (closed 4,460 in 45 owners, chart direct 2) plus 3 test fixtures outside issues/ (B,C).
- akrogon disk extras: 61 untracked logs in closed owners (904 KB), 18 untracked in system-flow/direct; the 4 tracked open paths are moved, byte-identical copies now under closed (B).
- Per-owner packed: framework 23.43 MiB over 46 groups, 110 s with tar and zstd -19; akrogon 1.18 MiB over 31 groups (C).
- History: framework 3,965 unique log blobs, 115.7 MiB of a 177,731 KiB pack; akrogon 558 blobs, 5.0 MiB (C).
- Receipt paths already dead today: akrogon 12 (old job worktree paths), framework 1 (B,C).
- completeOwner skips closed leaves (src/phase.ts:190-191), so it cannot migrate (B). sync commits from the default branch only and stages all eligible issues/ changes (src/sync.ts:30,141-165) (C); sync refuses staged non-issues paths like .gitignore (src/sync.ts:38-42) (B).
- The 9 akrogon "other" logs are peer-wait outcome lines in `chart/system-speed/slots/`, 1,128 bytes (B,C).

## Pitfalls
- Migrating before readers are installed: order is leaf merged, akrogon installed, then migration; compare `akrogon flaky` output before and after (B,C).
- Sync sweeps unrelated pending issues/ work into the migration commit: require clean `issues/` before the run, check the staged list (B,C).
- Disk differs from the index: B packs every disk log (untracked closed logs are evidence too); C stops an owner whose disk set mismatches `git ls-tree`. 
- 4,460 deletions are not reviewable by eye: the run prints per owner packed = present = deleted, plus a byte sample against `git show HEAD:<path>` (C).
- Expecting a smaller .git: say so in the run report (B,C).
- Scope creep: only `issues/closed/<owner>/` and ended charts' `direct/`; fixtures and slots files untouched (B,C).

## Open
- Q-open. Open or parked tracked logs: untrack now (A) or keep tracked until their close pack (B,C)? Today only akrogon's 4 stale paths.
- Q-slots. The 9 slots scraps: leave (B), or delete as junk under the operator's clean-folders rule (C asks).
- Q-dead. Repair the 13 already-dead receipt paths? Both B and C: no, record as baseline.
- Q-search. A list or search over archive members (C asks).
- Q-review. Does a peer check the framework run before it is pushed (C asks)?

## Where slots differ
- D-disk. Pack the disk set including untracked logs (B) vs stop on any disk/index mismatch (C).
- D-entry. One-time entry point (B) vs pack accepts a closed owner folder (C).
- D-open. Untrack now (A) vs keep until close (B,C).

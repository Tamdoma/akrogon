# Evidence location

## Question
Q1. Where does a leaf's full check evidence live after the leaf closes, so it stays lossless without about 1 GB of tracked logs in every checkout: in the repo in a compressed form (per log, or one archive per closed owner), or outside the repo with a short failure excerpt kept in the repo?

Q2. Are plain logs of an open owner committed before the close-time form replaces them? Today `akrogon sync` stages all of issues/ (src/sync.ts:154-165), so every plain log enters git history (C).

### Carries
- Reporter (seed #92): evidence kept losslessly in a smaller form.
- test-runs lock: issues/chart/test-runs/forks/base-red-rule.md:27 "keep logs" for a killed incomplete base run.
- Operator split answer 2026-10-15: `1a`.

## Findings
- run-check copies every run's full `out.log` into `<leaf>/implementation/check-<name>-<ms>-<pid>.log` (src/run-check.ts:207-209), then removes the run dir in `finally` (:220-221) (A,B,C,D; B R4).
- framework: 990,774,857 bytes (944.9 MiB) in 4,462 tracked logs; run-check copies about half (A,B,C,D). Since 2026-10-12: 443.2 MiB `check-*` (1,272 files) and 122.2 MiB seat-written (471 files) (A check).
- git pack for the whole framework repo is 173.6 MiB; the cost is working-tree size in the main checkout, clones and worker worktrees (A,B,C). akrogon leaf/verify/batch worktrees are sparse without /issues/ (src/next.ts:279-305).
- Readers: `akrogon flaky` reads red logs by path (src/flaky.ts:10-17); seats read printed paths during a pass (D).
- zstd -3 on a 1.5 MB verify.log: 1,501,189 → 177,521 bytes, byte-identical round trip (B). Exact byte dedup with all references kept is lossless (B R3).
- The whole-checkout target is out of reach through logs: node_modules 972 MB, .git 459 MB (A,B,C).
- Map picks: in repo per-log compressed (B), one archive per closed owner (A), host store `~/.akrogon/evidence` (C), leaf temp reaped at leaf end (D).
- Fork notes, 2026-10-15 ([merged](../slots/evidence-merged.md), rebuttals in slots/): one archive per closed owner (A,B,C,D); B moved from per-log after the size numbers.
- Size of framework's 944.9 MiB of logs: per log zstd -19 117 MiB (C), -3 141 MiB (D); one archive per closed owner zstd -19 23 MiB in 45 files (C), -9 37 MiB, -3 69 MiB (D); one tar of all 19 MiB (reporter).
- Log blobs cost 115.7 MiB of the pack across history; zlib already stores them about 8x smaller, and a per-log .zst blob does not shrink the pack (C).
- Seats read full logs while the owner is open (C,D). After close: flaky, people, and later seats following old evidence (skills/learn-issues/SKILL.md:14-22) (B).
- Recorded paths are absolute. Framework unique receipt paths: 1 exact, 75 via open→closed, 1 by neither; akrogon 21/21/12 (B,C). timings.jsonl is not an index of the copies: 1,088 `check_end` vs 1,606 files (C).
- No skill names a log file; 2,854 framework logs are hand-saved by seats (C).
- Outside-repo store rejected because no backup exists on this host besides GitHub, and other clones would hold dead pointers (B,C,D).
- Worker worktrees (skills/implement-issue/worker-protocol.md:11) are not sparse and carry issues/ (B,D).
- Q2 split: ignore open logs and commit only the archive (A,C,D); commit plain logs until the archive replaces them, so close is never the first backup (B).
- Read speed, A 2026-10-15: framework's largest closed owner backlink-audit-run, 148,460,033 bytes of logs, packs to 4,150,343 bytes (tar | zstd -19). Printing its last member with `tar -I zstd -xOf` took 0.03 s, byte-identical to the plain file.

## Taken
- Q2: operator 2026-10-15 `2a`. Plain logs of an open owner are not committed; only the close-time form enters git. Reason: keep history small; open logs living on one host for a few hours is accepted.
- Q1: operator 2026-10-15 reply "What does zip like mean? The problem is that these logs need to be read often when I refer to them. If we zip them they won't be able to be read." Q1 reopened with readability as a requirement.
- Q1: operator 2026-10-15 `1a`: pack at close, read with `akrogon log <path>`. Final shape after the final-shape check by B, C and D ([draft](../slots/evidence-final-shape-draft.md), returns `evidence-final-shape-{B,C,D}.md`):
  1. While an owner is open, run-check writes plain logs as today (src/run-check.ts:207-209).
  2. `.gitignore` gets `issues/open/**/*.log` and `issues/parked/**/*.log` through the `akrogon init` additions (src/init.ts:67-76), so sync never adds a new plain log, including after `akrogon park` (src/park.ts:68) (A,B,C,D). Logs already tracked stay tracked until existing-backlog decides (B,C). Chart direct logs belong to log-coverage (B,C,D).
  3. completeOwner, at the final `complete` gate before the rename (src/phase.ts:221-224), writes `<owner>/.closing`, then packs every `*.log` on disk under the owner into `<owner>/evidence.tar.zst` with members relative to the owner folder, built from files on disk, never from timings or receipts (C). Write to a temp name, read every member back byte-equal, rename into place, delete each plain log only once its exact bytes are in the verified archive, then rename the owner (A,B,C,D). A retry merges the archive's members with any plain log present, never fewer (B,C,D). An owner with no logs gets no archive (D). Symlinked logs are refused (C).
  4. run-check refuses a target under `issues/closed/` or under an owner holding `.closing`, both at start and again right before it publishes (src/run-check.ts:207) (B,C,D). Explicit holders under `issues/chart/` stay allowed (B,C,D). A refused publish exits non-zero naming the captured out.log and does not delete its run dir (B).
  5. `akrogon log <path>` takes a recorded path, absolute from any checkout root or relative to cwd. It resolves the repo from cwd, or outside a repo against every registered repo, failing when ambiguous (B,C). The first part after `open/`, `closed/` or `parked/` is the owner, the rest is the member (C,D). It prints the plain file, else the member from `evidence.tar.zst`, as raw bytes (B). No match or an unreadable archive exits non-zero naming the path.
  6. `akrogon flaky` uses the same resolver. `(log gone)` only when neither a plain file nor an archive exists; a broken archive or a member missing from an existing archive is an error (D).
  7. Pack and read with `Bun.Archive` plus `Bun.zstdCompressSync` level 19 and `Bun.zstdDecompressSync`, no new dependency and no child process (B,D). Probe, A 2026-10-15, Bun 1.4.3: a 174-char member name and bytes 0,1,10,13,128,255 round-tripped byte-equal, and GNU tar 1.35 `tar -I zstd -xOf` read the same file. Reads hold the whole owner in memory, 148 MB for the largest owner today (C): accepted.
  8. Skills that cite or read logs tell seats to use `akrogon log <path>`.
  9. A failed leaf that never closes keeps its plain logs on this host, uncommitted.

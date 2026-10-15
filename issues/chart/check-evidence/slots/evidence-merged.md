# Merged notes: evidence-location Q1

## Options
- O1. In repo, one compressed archive per closed owner, made at close; logs stay plain while the owner is open (A,C,D). Reason: plain logs for every in-pass reader, cross-run dedup, travels with git. Cost: zstd tar step in completeOwner before the rename (phase.ts:221-224), a member lookup in flaky.ts:10-17, operator reads with `tar -I zstd -xOf`. Framework today: 23 MiB in 45 archives at zstd -19 (C), 37 MiB at -9, 69 MiB at -3 (D).
- O2. In repo, one compressed file per log, written by run-check (B). Reason: per-run identity, no close-time step, works for chart direct holders that never close, no archive addressing. Cost: 117 MiB at zstd -19 (C), 141 MiB at -3 (D), 4,462 files; seats and tests can no longer read plain logs while open; no cross-run dedup.
- O3. Outside the repo (`~/.akrogon/evidence`) with an excerpt in the repo (none). Rejected: no off-host backup on this host, only GitHub (C); dead pointers on any other clone (B,D); excerpt is lossy (A,B,C,D); adds about 1 GB to ~/.akrogon against the worktree-cleanup clean-store rule (D).
- O4. Leaf temp reaped at leaf end (none). Rejected: deletes evidence, breaks base-red-rule.md:27 "keep logs" (A,B,C,D).

## Evidence
- One code reader opens a log after the run: flaky.ts:10-17 (A,B,C,D). verify, timing, reconcile and gates read only the path or metadata (B,C,D).
- Seats read full logs only while the owner is open (C,D). After close only flaky and a person read them (C,D). 302 closed framework reports cite log paths (B).
- Recorded paths are absolute (`/home/ivan/...`) in verify-runs.jsonl and timings.jsonl (B,C). Framework: 77 resolve exact, 75 via open→closed, 1 by neither; akrogon: 12 of 54 resolve by neither (B).
- Pack: log blobs already cost 115.7 MiB on disk across all history because zlib shrinks them about 8x (C). A per-log .zst blob does not shrink the pack (C).
- sync stages all of issues/ (sync.ts:154-165), so plain logs of open owners are committed today (C).
- No skill names a log file. The 2,854 hand-saved logs come from seats improvising "record its output" (C).
- akrogon worktrees are sparse without /issues/ (next.ts:302) (B,C,D). Worker worktrees per worker-protocol.md:11 are not sparse (B,D).
- Bun 1.4.3 has `Bun.zstdCompressSync` (C,D).

## Pitfalls
- P1. Old recorded paths stop resolving: archive member name = path tail from `issues/`, one resolver used by flaky and people; tries plain, closed, then owner archive member (A,B,C,D). The resolver must not depend on the host checkout root (B).
- P2. `(log gone)` hides missing evidence: a missing member is an error (A,B).
- P3. Plain logs removed before the archive is verified: write, read back each member byte-equal, then delete (A,B).
- P4. Archive made twice or early: only at the final `complete` gate right before the rename (D).
- P5. A log written after close is missed: completeOwner is the last writer; a plain log later found under issues/closed is reported, not dropped (C).
- P6. Chart direct logs never reach completeOwner (B,C). Belongs to log-coverage.
- P7. Size claims mix tree, pack and clone: report each separately (B,C).

## Open questions
- Q-commit. Should plain logs of an open owner be committed at all? Today sync commits them, so the pack keeps them forever even after the archive replaces them in the tree (C, B's "closure-only compression does not prevent earlier plain versions entering history"). Ignoring them keeps the pack lean but leaves open and failed leaves' logs on one host until close (C).
- Q-portable. Must a fresh clone on another machine read every full log? (B: yes). O1 and O2 both pass; O3 fails.
- Q-helper. A small read command given any recorded path (D).

## Where slots differ
- D-form. Archive at close (A,C,D) vs per-log at write (B). B: archive needs member addressing and a publish point outside closure. A,C,D: per-log is 5x larger, still 4,462 files, breaks plain reads while open, and does not shrink the pack.
- D-shared. B calls the owner archive mutable and shared by every leaf. C: written once at close, never rewritten.

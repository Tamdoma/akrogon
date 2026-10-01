# Leaf temp

## Question
Q1. Where does a leaf's temp folder live, given Chromium's socket under TMPDIR must stay within the 108-byte Unix socket limit and slugs and repo keys have no length cap?

Q2. When is it deleted: when the leaf merges (its worktree can outlive it until siblings merge), and what happens to a failed leaf's folder against OS age cleanup?

Q3. What exports it: `TMPDIR` only, or also `TMP`/`TEMP`, and is an explicit carry to workers needed?

### Carries
- check-proof Taken 2026-10-01 Q2 2a: the base-run worktree lives under the leaf temp folder.
- Operator note: "resolved graciously, without overcomplicating the system or adding new mental model strains."
- Related: ../slots/map-merged.md F6-F8, ../slots/map-rebuttal-B.md R2-R4, ../slots/map-rebuttal-C.md D1.

## Findings
Rounds: ../slots/leaf-temp-A.md, -B.md, -C.md, merged ../slots/leaf-temp-merged.md, rebuttals -rebuttal-B.md (R1-R4), -rebuttal-C.md (none).

- Bound: system Chromium 1243 aborts `Socket path too long` at TMPDIR 73 chars, starts at 23; Playwright headless shell 1243 starts at 73. TMPDIR must be at most 62 bytes. Slugs reach 30 chars today and have no cap. (A probe 2026-10-01; A,B,C)
- Export: codex-cli 0.159.2 and pi 0.99.1 pass TMPDIR to shell commands (`os.tmpdir()`, `mktemp -d`); codex put bwrap mount targets there, pi its jiti cache. Claude Code 2.1.286 creates `<TMPDIR>/claude-<uid>` (earlier probe with inherited session); a clean Claude probe was refused by the permission classifier, and Claude is not a configured slot harness. TMPDIR only. (A,B,C)
- Per-user parent `/var/tmp/akrogon-<uid>` avoids one user owning a shared 0700 parent. (B R1, adopted)
- Deletion point: after the merged leaf's seats stop and before the `issues/open` early return in `cleanupMerged` (`src/next.ts:559-565`); worktrees of merged leaves wait for siblings (`src/phase.ts:138-142`), six such framework leaves today. (A,B,C) B R2: tab-close return does not prove shutdown, and `next` closes merged tabs without waiting for idle (`src/next.ts:744-753`).
- Aging: `/var/tmp` ages at 30 days (`/usr/lib/tmpfiles.d/tmp.conf`). B R3: timestamps do not protect a live file not recently touched; systemd guidance recommends directory locks for live trees. No lifetime owner that could hold such a lock has been found.
- Tests: inject the temp root internally so tests never write `/var/tmp`, no public setting. (B R4, adopted; C silent)
- Base worktree from check-proof 2a is removed with `git worktree remove` after the comparison; cleanup runs `git worktree prune`; the report keeps failing names and log tails. (C)
- Research: practitioner · Lennart Poettering et al., https://systemd.io/TEMPORARY_DIRECTORIES/ (B 2026-10-01): large temp belongs in /var/tmp, aging is not tied to process lifetime. better-than-training · unix(7) sun_path 108 bytes; Node os.tmpdir docs; src paths above.

Partial answers, operator 2026-10-01, verbatim: "1 - leaning towards a, but why can't it all be inside of the repo where akrogon is doing work, why does it HAVE to be in /var/tmp/? I'm just asking I'm a noob. | 2a - How will that work exactly? I'm just afraid we are adding more complexity, but it's fine. I just need to understand. eli | 3a - Does it have to be after 30 days? I don't think it should be more than 7 days, honestly. What is the catch here? | 4a |"
- Q1: open (leaning 1a, asked why not inside the repo).
- Q2 2a taken: delete once the merged leaf's tab is confirmed gone. Final check C (../slots/leaf-temp-final-check-C.md): `cleanupRepos` runs only on bare manual `next`, `--all` and `--resume` (`src/next.ts:686-724`); the normal merge goes B idle -> hook closes tab (`:739-760`) -> `tab.closed` hook -> `tab_closed` branch (`:728-738`), which never calls `cleanupMerged`. So the deletion runs in the `tab_closed` branch when the owning leaf is merged (the event confirms the panes are gone), with `cleanupMerged` deleting when the tab has no live panes as catch-up. Same rmSync + `git worktree prune`, errors via `report()`. B final check R1: the existing hook closes a merged tab without requiring B idle (`:744-753` excludes only blocked/unknown); that pre-existing close race is outside this fork, and deletion after it adds no new interruption.
- Q3 3a taken with operator correction: expiry no more than 7 days. B final check R2: an mtime-only 7-day whole-folder sweep can delete scratch of a live or paused leaf untouched for 7 days; acceptable only if the operator accepts that explicitly. Owner of the 7-day rule is open.
- Q4 4a taken: `TMPDIR` only via `placement`; workers inherit; one skill line.

## Taken
Operator 2026-10-01, verbatim (round 2): "1 - leaning towards a, but why can't it all be inside of the repo where akrogon is doing work, why does it HAVE to be in /var/tmp/? I'm just asking I'm a noob. | 2a - How will that work exactly? I'm just afraid we are adding more complexity, but it's fine. I just need to understand. eli | 3a - Does it have to be after 30 days? I don't think it should be more than 7 days, honestly. What is the catch here? | 4a |"
Operator 2026-10-01, verbatim (round 3): "1a | 2a |"

- Location (Q1 1a): `/var/tmp/akrogon-<uid>/<slug first 20 chars>-<12 hex of sha256(repo.root + "\n" + slug)>`, derived by one function beside `worktreeStore`, never stored; parent and leaf folder created 0700 with ownership checked; at most 61 bytes for a 10-digit uid, inside the measured 62-byte Chromium limit. Reason: inside the repo the path exceeds the Chromium socket limit (framework worktree root alone is 57 chars) and temp files in a worktree make `akrogon phase` refuse it as dirty (`src/phase.ts:253-256`). Tests use an internal root and never write `/var/tmp`, with no documented config key. Foreclosed: hash-only name, mkdtemp recorded in state, `<repo>/<slug>` names, worktree-side and `~/.cache` folders.
- Deletion (Q2 2a): delete once the merged leaf's tab is confirmed gone: in the `tab_closed` hook branch when the owning leaf is merged, with `cleanupMerged` as catch-up when the tab has no live panes, before its `issues/open` early return; `rmSync` recursive force, then `git worktree prune` at repo root; errors through `report()` and retried on the next run. Failed leaves keep their folder. No phase-end wipe. Foreclosed: delete right after the tab-close command, delete with the worktree.
- Expiry (Q3 3a, corrected to 7 days; round 3 Q2 2a): temp is scratch; evidence (failing names, log tails) goes in the leaf folder. Operator's `~/.local/bin/tmp-sweep` gets one loop deleting `/var/tmp/akrogon-<uid>/*` entries whose newest file is older than 7 days; no akrogon code. The operator accepts that a leaf paused 7 days with no file changes loses its scratch. Foreclosed: akrogon-owned age sweep, OS 30 days only, lock or tmpfiles exclusion.
- Export (Q4 4a): `TMPDIR` only, via `placement` in `allocate`; folder created on every dispatch; workers inherit. One skill line in implement-issue, check-issue and merge-issue: temp files, logs and base copies go under `$TMPDIR`, never a fixed `/tmp/<name>`; anything needed later goes in the leaf folder. Foreclosed: `TMP`/`TEMP`, explicit worker carry.

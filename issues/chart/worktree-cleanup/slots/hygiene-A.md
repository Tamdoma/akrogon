# Notes, slot A (written before reading B, C, D)

Evidence: Explore inventory of akrogon writers and live host, 2026-10-15 (src/config.ts:197-199, :266-300; src/run-check.ts:154-163, :221; src/reconcile.ts:22-41, :396-438; src/verify.ts:126-189; src/batch.ts:115-155).

## Q1 locations
- Pick: every root akrogon owns: each repo's worktree store and the legacy `<repo>/issues/worktrees`, the leaf temp root `/var/tmp/akr-<uid>/` (leaf scratch, run-check run dirs), and akrogon's own state folder (`globalHome`: reconcile reports, runs/, locks). Reason: these are the places akrogon creates and no person is meant to keep things in. Cost: anything a person parked there is deleted.
- Not in scope: repo tracked files (logs are chart check-evidence), worktrees registered by other tools (`/tmp/claude-*/scratchpad` worktrees are another agent's), `~/.config/akrogon/env` (operator input).
- Live today: stores empty; `/var/tmp/akr-1000` holds 454 MB, of which one 450 MB framework run dir `run-RewR23` kept as `no .owner record`, 45 empty top-level dirs, two loose `f8-*.log` files; framework legacy store holds `.temp`, `.dcf*.node-gyp`, `emdash-conversion-ufix-b`; `~/.akrogon/worktrees/repo` belongs to no registered repo; the framework kept report lists nine paths that no longer exist.
- Rejected: only the worktree store (leaves 450 MB run dir and empty temp dirs).

## Q2 safe to delete
- Pick: inside an owned root, delete when (a) not a registered worktree of a live leaf/verify/build/worker per the taken rules, (b) no live process has it as cwd or holds a file in it (scan /proc/*/cwd and /proc/*/fd), (c) no live pane inside, and (d) for items with no owner record, untouched for a quiet period (e.g. 1 hour by mtime) so a folder being created right now is not taken. Reason: (b)+(d) cover tools that write caches mid-build. Cost: a /proc scan per pass; junk lives up to the quiet period.
- Rejected: name patterns alone (not proof); age alone (long builds).
- Pitfall: a process in another mount namespace or a sleeping tool that resumes later; removed by the quiet period plus owner records where akrogon writes them.

## Q3 when and what if unproven
- Pick: every reconcile pass (each `akrogon next`, tab close, resume), also for repos with no open leaves. Anything in use stays and shows in plain status with the reason (4a); nothing is kept just for being unknown.
- Rejected: a separate manual clean command (the operator wants it always clean).

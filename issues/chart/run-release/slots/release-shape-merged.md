# Merged notes: release-shape

## Q1 state home
- Stay in workspace root, found by one fixed pointer outside the release and independent of cwd (e.g. `~/.akrogon/home`); AKROGON_HOME still overrides; missing pointer is a clear error, never a new empty home (A,B). Reason: no migration of live locks, tracked files stay tracked, smallest change. Cost: release depends on the pointer; workspace move needs a pointer update.
- Move to `~/.akrogon`, one-time migration while paused, at the first flip (C). Reason: removes code/state coupling fully; `~/.akrogon` already holds worktrees/, run.lock, framework-tests.lock. Cost: migration ordering (copy, flip, verify, then untrack config.yaml later), bootstrap for missing config.yaml (src/config.ts:206, src/install.ts:57).
- Evidence: globalHome consumers config.yaml, .lock, paused.yaml (src/pause.ts:20), stopped.yaml (src/stop.ts:18), runs/ (src/admission.ts:40,90-101), reconcile/, relative repo paths (src/config.ts:210), sync lock (src/sync.ts:26) (B,C). State is a few KB (C).
- Pitfall: two homes split locks and hide live runs; every entry point (installed command, `bun src/akrogon.ts`, skill scripts importing src/config.ts, systemd, herdr hooks) must resolve the same home (B,C). Pitfall: any writer addressing toolRoot instead of globalHome recreates state inside a release that cleanup later deletes (C).

## Q2 old releases
- Keep current + previous; delete older only when no process started from them; needs a new per-process "started from release X" record (pid, boot id, commit) removed on exit, dead pid clears it, because cwd/fd scans cannot attribute a bun process to a release (B,C; C measured argv shows the ~/.local/bin symlink, bun does not hold .ts open). A had assumed the reconcile process-inside check suffices: it does not (B,C).
- Fixed count only: can delete a release a long command still lazy-imports from (src/akrogon.ts dynamic import) (A,B,C).
- Size ~98 MB per release (node_modules 66 MB, skills 32 MB) (C).
- Pitfalls: flip `current` by rename of a temp symlink, never unlink+create (C); a process must import only from the release it started in (B); count previous successful activation, not failed builds (B).

## Q3 failed build
- current stays, dispatch continues, failure reported with attempted and active commit and error, retried next trigger (A,B,C). Stop-dispatch rejected: a fix lands through dispatch, so stopping can deadlock repair (C); one bad install halts all work (A,B).
- Build into a temp sibling, rename to releases/<commit> only when install and checks pass (C); candidate build touches no active links, dependencies or state (B).
- Persist last deploy result in state home and show a not-current release in `akrogon status` (C).
- First install has no previous release and must fail plainly (B).

## Open questions raised
- Rollback: who flips back, and what stops the next deploy flipping forward onto the same bad commit (C).
- Activation boundary for links, plugin, systemd: links point at `current` once, so a flip needs no relink (C map); one-time install vs per-release steps must be defined (B).
- Old/new release reading the same state: strict global schema (src/config.ts:23-30) can make a rolled-back release reject state a newer one wrote (B).
- Behind-threshold alert: when does staying stale need a person (C).

## Differences
- Q1: A,B stay with pointer; C move to ~/.akrogon.

# Final Probe Check — Seat E

1. **`forks/session-id.md:43` & `forks/chart-door.md:39` — Resolver reads *after* the reset warm-up have no `<code>`:**
   - **Gap:** P3 (`forks/proofs.md:26-27`) proved that after `/clear` (Claude) or `/new` (Pi), Claude's `/proc/<pid>/fd` still holds the *old* `<id>/tasks` handle and Pi's `argv` still holds the *old* `--session-id <uuid>`. The handover helper (`chart-door.md:39`) has `<code>` from `"reply OK <code>"` and finds the new transcript, but when Fresh A wakes up on the start prompt (`chart-door.md:33,35`) or `chart-usage.ts` runs at Close, those callers invoke the resolver on A's terminal *without* `<code>`. If the resolver falls back to `/proc/<pid>/fd` (Claude) or `--session-id` (Pi), it will return the pre-reset transcript and fail Fresh A's handover continuation check.
   - **Fix:** When the code lookup resolves the post-reset transcript path, persist it on the terminal's label (`hc label <t> ...`), and have subsequent non-code resolver calls on that terminal return the label's path when it is newer than the initial `/proc` `tasks` handle or `--session-id` file.

2. **`forks/session-id.md:43` — Codex has no per-`cwd` transcript folder:**
   - **Gap:** `session-id.md:43` says *"the transcript is the file in that kind's transcript folder for the seat's cwd that contains it"*, but Codex stores rollouts by date under `~/.codex/sessions/<YYYY>/<MM>/<DD>/rollout-*.jsonl`, not by `cwd` (`forks/proofs.md:7,25`).
   - **Fix:** As P3 (`forks/proofs.md:25`) proved, after the `"reply OK <code>"` warm-up prompt Codex opens the new rollout in `/proc/<pid>/fd`; Codex's post-reset lookup should check the process's open rollout files in `/proc/<pid>/fd` (newest first) for `<code>`.

3. **`forks/config.md:37` — `agy` start in an already-trusted folder skips `blocked`:**
   - **Gap:** `config.md:37` assumes `agy` always starts `blocked` (`msg: Trust this folder?`), but P5 (`forks/proofs.md:39`) and P8 (`forks/proofs.md:55`) showed that a consultant in a listed repo root or a restarted `agy` seat in the same worktree (already appended to `trustedWorkspaces` on first start) goes straight to `idle`, turn 0 without showing the trust dialog. Pressing `enter` or waiting only for `blocked` would hang or send a stray keystroke.
   - **Fix:** Make the trust step conditional: wait for `blocked` (`kind: permission`, `msg: Trust this folder?` → press `enter`, wait for `idle`) **or** `idle` (already trusted → no `enter`), then `hc send` the first task.

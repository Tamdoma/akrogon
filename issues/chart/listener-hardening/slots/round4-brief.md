# Round 4 brief (door A, 2026-11-08): review the listener recovery commit

R1 (done re-prompt) and slot B under A are on main (447b8ecd) and deployed.

Branch `fix/listener-recovery` in worktree `/tmp/claude-1000/-home-ivan-Work-infra-akrogon/4a3df037-e5ba-4393-85f4-67eb6d4ba7e8/scratchpad/k3`. Read with `git -C <worktree> log -p origin/main..HEAD` (one commit).

Merged from your round 2 answers:
- Failed pass (C R2, D R1, B R2), hung pass (B R1, D R1): pass child killed at AKROGON_PASS_DEADLINE_MS (20 min); a nonzero exit schedules one retry after AKROGON_LISTEN_RETRY_MS (60 s) = one `next --resume` plus one scan. One pending retry at a time.
- Session isolation (D R3, B R5): a failed stream drops only that session and waits for the retry (no immediate rescan, so an instantly failing stream cannot spin); a normally ended stream rescans at once as before; a failed watcher wake is logged only; a failed scan is logged and retried. Only a broken fs.watch or an unspawnable pass is fatal (systemd restarts).
- Catch-up on every snapshot (D R4, B R4): `catchUp` deleted; the queue dedups.
- Missing socket folder at boot (D R7): `mkdirSync(socketDir, {recursive, mode 0o700})`.
- hc deadline (C R4, D R2): `hc()` defaults to 60 s when the caller sets none; `rpc` keeps its 10 s discovery deadline.

Not in this commit, on purpose (say if you think one must be in): flock -w (holders are now bounded by the hc and pass deadlines), the silent-stream heartbeat check (D R6), topology/doc events waking the queue (B R3), `not_started` hold attention (C R3, B R6), the busy-deadline timer (B R7), e2e tier launchers (B R8), per-leaf session resolution (D R5).

Evidence: 4 new tests fail on the old code and pass on the new; full suite 1139 pass, 3 known env-only failures, hc-shutdown units 1109 -> 1109.

Write `issues/chart/listener-hardening/slots/round4-<letter>.md`: concrete defects only, path:line, then `Verdict: ready` or `Verdict: changes needed`. Reply with the path. All three review.

## Update after C's round 4 (amended commit, same branch)

C D1 fixed: `watchSocket` runs before `follow` and `subscribed.add`, so a vanished socket throws before anything starts. C D2 fixed: the retry re-runs each failed pass (a failed `pull --all` is retried as `pull --all`); a failed stream or scan retries with `next --resume`. New test: a failed pull is retried as a pull. B, if you already started, review the amended HEAD.

## Update after B's round 4 (amended again, same branch)

B F1 fixed: each pass spawns with `detached: true` (setsid, own process group) and the deadline sends SIGKILL to the whole group (`process.kill(-pid)`); the hung-pass test now starts a background command and checks it is gone or a zombie after the kill (it stays sleeping on the previous version). B F2 fixed: a subscription with no first snapshot within AKROGON_SNAPSHOT_MS (30 s) is stopped and goes to the retry; new test with one silent session and one healthy one (times out on the previous version). Full suite: 1141 pass, the 3 known env-only failures, units flat. Re-check the amended HEAD in `round4-<letter>-3.md` (B) or `round4-<letter>-3.md` (C, D): `Re-check: ready` or concrete defects.

# Concurrency sweep 2026-10-13 (load-guard 2a)

Setup: 4 detached framework worktrees at origin/main 5870a83d1, one-line edit to .claude/skills/dev-cf-workers-deploy/SKILL.md, test:changed selected 100 of 139 (sequential runner), each run in its own scope in akrogon.slice with TMPDIR per run and the bus cut; 8 live framework leaves running at the same time. Solo baseline from timings: 731-826 s.

```
N=2 run=1 exit=1 secs=896
N=2 run=2 exit=0 secs=942
== N=2 end makespan=946s peak=45347901440 events: low=0 high=0 max=0 oom=0 oom_kill=0 oom_group_kill=0 sock_throttled=0 
N=4 run=3 exit=143 secs=741
N=4 run=1 exit=143 secs=742
N=4 run=2 exit=143 secs=741
N=4 run=4 exit=143 secs=741
== N=4 end makespan=742s peak=58558210048 events: low=0 high=0 max=0 oom=0 oom_kill=0 oom_group_kill=0 sock_throttled=0 
```

- N=2: run 1 failed test:motion-probe, port 8177 already used (fixed port, motion-probe/playwright.config.ts:21,34).
- N=4: all four killed by SIGTERM at 14:04:08Z, 741 s in, before finishing. Cause: seat technical-pack-selection ran `pkill -f 'run-test-changed.ts'` at 14:04:09Z (its pi session), which matches every leaf's and the sweep's test:changed on the host. N=4 numbers are partial: peak slice memory 58.6 GB by 741 s, memory.events all 0.
- Slice cpu.stat nr_throttled 20,753 by the end (16-core quota hit often).
- After the SIGTERM, scopes sweep-4-1 and sweep-4-2 still held 155 live Chrome processes (desktop /usr/lib/chromium with 3 extensions, page-measure profiles) 2 min later: a killed test:changed does not take its browsers down. Stopped by `systemctl --user stop sweep-4-*.scope`.

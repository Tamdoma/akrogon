# Independent map: watch-live-speed (slot C)

## 1. Root cause of "receipt due=1 missing" (shell shape)

- **Primary cause — test-infrastructure defect (`watch-tier.ts` + `unpause`), not a pin or receipt design defect.**
  - `tests/e2e/watch-tier.ts` (`startWatchTier`) writes `worktree_root: leafTemp` into `<root>/issues/config.yaml` while also placing `<name>-rt` (holding the symlinked `herdr-core/akr-e2e-watch.sock`), `-logbin`, `-shimbin`, `-flags`, `-scratch`, `-appbin`, `-standin*` directly inside `leafTemp`.
  - In `tests/e2e/watch-live.e2e.ts` (`shape === 'shell'`), start pins the foreground harness and launches `t2` cleanly; then `tier.akrogon(['unpause'])` calls `src/next.ts` (`unpausePass`) -> `reconcileRepos` -> `src/reconcile.ts` (`dropUnowned`), sweeping every unowned dir in `leafTemp` — deleting `<name>-rt` (the timer's `XDG_RUNTIME_DIR` socket) and all test helper dirs while the run is live. Verified live: only `<name> sp` (live pane) and `<name>-home` survived under `/tmp/akr-e2e/`.
  - `skills/watch-issues/scripts/timer.ts` (`poll`) then fails `terminal(args.session, args.watcher)` with `HcError` on every poll and silently returns `'stay'`, accumulating dues with zero sends while `t2` stays live (`check-watch-live-{claude,codex,pi}-shell-*.log`; `/tmp/watch-timer.log` shows `watcher state=live status=done ready=true` stopping at `17:34:28Z` right at `unpause`, followed by `crossed=true dues=1,2,3,4 awaiting=-` with no sends; transcripts confirm zero ticks arrived). `root` shape never calls `unpause`, so `pi-root`/`agy-root` passed.
- **Secondary product/skill/test defects exposed in logs (distinct from the shell failure):**
  - `timer.ts` (`poll`): (a) `if (!crossed || ...)` blocks queued busy dues until the next boundary instead of sending when the turn ends (violates `design.md` item 5); (b) A's uncommitted edit dropped `sent.started` and `Awaiting.turn` checks; (c) silent `HcError` swallow hid the missing socket across 8+ paid runs.
  - `skills/watch-issues/SKILL.md` (`Invocations`): tells watchers to run `akrogon status <root>`, but `akrogon status` takes a slug (`Missing leaf` on all 4 harnesses, causing early `claude-root`/`codex-root` `statusCalls=2` reds).
  - `watch-live.e2e.ts`: `claude-root` `beforeOld` raced a live timer tick (`check-watch-live-claude-root-1795194141217-3557189.log`); `codex-root` `hold-status` 75s left `t=5..8` running `config` without `status` (`e2e-codex-root/*-calls.log`).

## 2. Why ~4h and 22+ paid launches against grant of 8

Exact tally from `issues/timings.jsonl` (13:46Z–17:34Z, `check_end` + active run): **22 completed paid launches** (52.3m active test wall) + 1 in-flight = **23 vs grant 8**, plus **17 pre-launch <1s crashes** (ZodError, socket path >=107B, leftover core). Ranked by time & cost:
1. **Live e2e serial debugging & blind loops (~2h+ wall, 22 paid runs in `implement`):** single-session `akr-e2e-watch` forced serial 140–347s runs; A ran 7–8-run bash loops (`16:25Z`, `16:59Z`) that kept launching after identical failures; 8+ paid shell runs chased the deleted `-rt` socket without checking `timer.ts` errors or testing `unpause` free; 4 paid `pi-root` runs debugged `~/.pi/agent/skills/watch-issues` + recursive `.e2e-hold` skill collisions; `17:22Z` interruption orphaned `akr-e2e-watch` mid-`agy-shell` (`capture-watch-live-agy-shell-d50d8cba-*`).
2. **Oversized worker `watch-timer-u1` (~1h42m wall, `14:25Z`–`16:08Z`, 0 paid runs):** `plan.md` Waves gave `u1` all 7 scripts while `u2` (docs) took 5m; `u1` ran 176 `exec` calls and 10 `check-watch-timer` runs (10.6m) debugging `HC_TERMINAL_SOCKET` parenting, `watch-agent.sh` pause parsing, edit typo, and test flakes. Invisible to the watcher: `skills/watch-issues/scripts/log-tail.ts` (`collectPi`) parses `exec` expecting `args.code`/JSON blocks, printing `exec #- -> unknown,unknown:` on pi's `exec` records.
3. **`plan.synthesis` (~37m, `13:46Z`–`14:23Z`, 1 paid run):** built 732-line free + 463-line live suites in one pass and ran paid `watch-live-red` (27s), spending 1/8 of N1 before `implement` began (`plan.md` Grant accounting).
- **What should have stopped it and did not:** `lifecycle-rules.md` (`Grant reuse and count lines`, from `grant-run-count`) uses text-only **warn-and-run** (signpost 2b) with no mechanical counter in `src/run-check.ts`; A wrote no `implementation/report.md`, zero count lines, and zero warnings; `proof-cost` 2a allowed serial live sessions because `brief.md` named `akr-e2e-watch`; `proof-limits-handoff` didn't audit test-tier wiring (`watch-tier.ts` `worktree_root` + `unpause`, pi user-skill precedence); A resumed after the `17:22Z` abort without `cleared-*.md` (`implement-issue` `implement`).

## 3. What to do with the running leaf now

- **Let finish (reject):** seat A is still launching paid `claude-shell` sessions every ~2.5m (23+ spent) with uncommitted debug edits and regressed `timer.ts`; high cost, dirty review.
- **Stop now, fix in place (fastest path to merge):** stop A, revert debug/regression edits, fix 3 defects (`watch-tier.ts` `worktree_root: <name>-wt`, `timer.ts` send gate/`Awaiting.turn`/error log, `SKILL.md` `akrogon status`), add free shell+`unpause` test in `watch-timer.test.ts` (0 paid), renew N1 for 1 clean 8-session pass. Cost: ~40m wall + 8 paid sessions (serial) + review/merge; preserves 7 scripts + 8/8 free suite.
- **Stop now, re-chart into 3 leaves (recommended — matches operator F3+F4 & prevents repeat):**
  1. `watch-tier-parallel` (prerequisite): per-run session name + isolated `worktree_root` + safe trust/skill isolation; proven free (0 paid, ~20m).
  2. `watch-timer` (product only, criteria 1–10): scripts + `SKILL.md` + docs + free suite incl. shell+`unpause`; reuse existing branch work (~25m, 0 paid).
  3. `watch-timer-live` (`blocked-by: [1, 2]`, criterion 11): 8 parallel sessions (~6–10m wall, 8 paid under renewed N1).
  - Cost: ~1h wall across 3 leaves + 1 chart handoff, 8 paid sessions; leaves parallel e2e machinery landed.

## 4. Systemic fixes by layer (removes | could break | prior chart)

- **Chart — scope & proof design:**
  1. *Split product leaf from multi-session live-proof leaf* | Removes product/review rework coupled to slow paid e2e | Extra handoff/merge; live-found product bug needs in-branch fix (`cross-leaf-proof` allows bounded ones) | New (not decided).
  2. *Require parallel-capable tier as prerequisite for repo-owned live tiers (close serial-excuse loophole for own machinery)* | Removes 8x serial waits (45m->6m) | Extra prerequisite leaf when tier is single-session | Amends `proof-cost` Q2 2a (which allowed serial if brief named shared resource).
  3. *No paid plan-stage red run when free suite already proves red; keep N1 for implement* | Removes guaranteed 9/8 overrun before implement starts | Live test wiring checked only at implement (mitigate via `tsc` + free dry-run) | New (`paid-proof-bounds`/`grant-run-count` silent on plan red runs).
  4. *Extend charting key-part proof to test-tier wiring & user-skill precedence* | Removes 4 pi collision + 8 `unpause`-sweep paid runs | Slight charting prep | Extends `proof-limits-handoff` (landed `5499e3da`).
- **Plan:**
  1. *Balance wave units (split 7-script `u1` into helpers+start/stop vs timer/tick)* | Removes 1h42m straggler worker | Interface churn if split across tight contracts | Extends `leaf-speed` (`chained-units` handled serial-solo only).
  2. *Require free stand-in coverage of every live-test path (shell shape, `unpause`, space-root)* | Removes finding deterministic bugs inside 140–340s paid runs | Small extra free-test code | Already decided in `cross-leaf-proof` / `standing-design.md` (cheapest sufficient test) — enforcement gap.
- **Implement:**
  1. *Canary-first live order (1 run before batch), single-run reruns, stop-and-reproduce-free rule for test/deterministic bugs* | Removes 7-run red loops & 8x identical paid failures | +1 turn when all 8 pass first try | Partially decided (`implement-issue` cheap-first; `paid-proof-bounds` `fresh-run-need` 1a smallest fresh call) — never blocked batch loops or diagnostic paid runs.
  2. *Fix `skills/watch-issues/scripts/log-tail.ts` (`collectPi` `exec` parser)* | Removes `exec #- -> unknown,unknown:` watcher blindness on pi workers | None (read-only) | New.
- **Test machinery:**
  1. *Parameterize `watch-tier.ts` session name (`akr-e2e-w-<id>`) + `worktree_root: <name>-wt` + lock/isolate shared `$HOME` trust & skill dirs* | Removes `reconcile` mid-run deletion, >=107B socket paths, 8x serial bottleneck | **High risk if done naively:** parallel runs race on `~/.claude.json`, `~/.codex/config.toml`, `~/.gemini/antigravity-cli/settings.json` and `~/.pi/agent/skills` holds unless serialized/isolated | Implements `proof-cost` Q2 2a for watch tier.
  2. *Pre-launch free gate in `watch-live.e2e.ts` (env, socket len, skill-collision check, stand-in dry-run)* | Removes 17 pre-launch + 4 skill-collision runs | ~2s startup | Extends `watch-tier.ts` `observeReady`.
- **Enforcement (grant counting):**
  1. *Mechanical run-check cap or hard-stop on paid repeat bounds (reversing warn-and-run)* | Removes silent 23/8 overruns when seats skip count lines | **Reopens 3 operator locks:** `proof-cost` (no budget), `paid-proof-bounds` `limit-mechanism` (no counter), `grant-run-count` 1c/2b (text-only warn-and-run); `run-check` still misses nested launches, though it catches 1-session-per-`run-check` loops | Contradicts `grant-run-count` & `paid-proof-bounds` — needs explicit operator decision.
  2. *Minimal lock-compatible floor:* require `watch-issues` / `run-check` to flag repeated red checks of the same live name (e.g., >2 red `watch-live-*`) to the operator, and enforce pre-launch count-line presence in `implement-issue`. | Stops runaway debug loops early | Low; needs watcher/skill tweak | New (fits inside `grant-run-count` 1c).

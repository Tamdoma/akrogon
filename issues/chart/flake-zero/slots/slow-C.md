**Recommendation: O4 (drop `test.serial` in `tests/watch-timer.test.ts`) + O3 (`AKROGON_PASS_DEADLINE_MS` to `'10000'` or `'5000'` in `tests/hc-listener.test.ts`).** Net-negative code, zero new files, faster than O1 + O3 (~80–95 s suite wall vs ~110 s).

1. **Why dropping `test.serial` beats O1, O2, and a fake clock:**
   - All 17 tests in `tests/watch-timer.test.ts` are marked `test.serial` (`:343`–`:1342`), even though **none** mutates `process.env`, `process.chdir`, or shared module state — each creates its own `hcFixture()` (private `f.home`, `f.root`, `hcCore` session, `standin`, `flags`).
   - `bunfig.toml:4` already enables `concurrentTestGlob = "**/*.test.ts"` and `issues/config.yaml:9` passes `--max-concurrency=5`. Removing `.serial` lets Bun run 5 mostly-timer-waiting tests concurrently in one worker, cutting `watch-timer.test.ts` from 118 s to ~30–40 s with **zero new files or extracted fixture helpers** (unlike O1, which splits into 3–4 files just to work around unnecessary `test.serial` and still runs each file serially).
   - Reject O2 (`WATCH_TICK_SECONDS=0.5`: tight real-time boundaries under load risk flakes) and a fake clock in `timer.ts` (adds production test hooks for no gain over native concurrency).

2. **For O3 (`tests/hc-listener.test.ts:245–286`): `'10000'` ms (or `'5000'` ms) is safe.**
   - Look at `akrogonShim(f)` (`:18–42`): this test passes `forward = null`, so its "ordinary passes" (`pull --all` and the retried `next --resume`) do **not** run `bun`, `akrogon`, or `git` — they are a 5-line `/bin/sh` script doing `mkdir`, `echo`, `rmdir`, `exit 0`.
   - `500` ms flaked under heavy load; `WAIT_MS / 2` (45 s) was massive overkill for a `/bin/sh` `echo`. Setting `AKROGON_PASS_DEADLINE_MS: '10000'` (20x the old 500 ms, saving ~35 s; or `'5000'`, saving ~40 s) easily covers shell-spawn jitter under load 77 while dropping `hc-listener.test.ts` from 45 s to ~10 s. The test still covers real deadline-kill + retry without changing `src/listen.ts`.

3. **F3 (`issues/config.yaml:9` `--rerun-each=5`):**
   - Keep `--rerun-each=5` (do not weaken the flake gate). Dropping `test.serial` cuts `watch-timer.test.ts`'s `--rerun-each=5` from ~10 min to ~2.5–3 min automatically.
   - Optional clean tweak: if `verify`'s slow alarm (`>194 s`) shouldn't fire whenever a PR touches a slow test file, split the `--rerun-each=5` step into its own `repeat:` check in `full: [test, repeat]` so `test` stays comparable across PRs.

**Main risk:** running 5 `watch-timer` cores concurrently inside one worker increases local contention around `WATCH_TICK_SECONDS=2` boundaries; prove it before landing with `--rerun-each=5` alongside a full suite run (if any individual test is load-sensitive, keep `test.serial` only on that test rather than all 17).

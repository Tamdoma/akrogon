# Review A (check.review, initial, blind)

- Base: 99a256a8e57de5a05a8fa5c28cc109d710ba3101 (AKROGON_BASE, = origin/main at review)
- Reviewed head: 8b317badd7ef3974232abd37910eee42d1224d58
- Verdict: fix

## Verification evidence

- `akrogon verify` on 8b317bad: green. setup, format and typecheck exit 0; test 1265 pass, 0 fail, 75.28 s (`verify test: 0 .../implementation/check-test-1794098861863-3065044.log`).
- Criterion 9: kinds tier K-9 green on 8b317bad (`check kinds-tier-9: 0 .../check-kinds-tier-9-1794098736021-3059316.log`); per-kind records in `implementation/kinds-tier/`.
- Criterion 7 live half: window tier green (`check window-tier: 0 .../check-window-tier-1794096461414-2984176.log`). `git diff --stat 095b19e2..HEAD -- src tests/e2e/window.e2e.ts tests/e2e/tier.ts` is empty, so its inputs are unchanged since.
- Criterion 14: `plugin/` is absent at head, and src is unchanged since the recorded scoped grep (`check c14-grep: 0 ...`). The remaining `herdr` uses in engine paths are notice sends and the `src/shell.ts` exports, as the criterion allows.
- AREA.md paths: one listing over `src/AREA.md` and `tests/AREA.md` shows no missing repository path. The "missing" tokens are runtime names and patterns (`issues/timings.jsonl`, `<name>.sock`, `check.review`, ...), not files.
- Docs: `docs/reference/commands.md` (`install`, `listen`), `docs/reference/releases-and-updates.md` and `docs/start/install.md` match the shipped behavior. The plugin lines in `install.md` are conditional on `plugin/` and still true.
- Grant count audit (`grants[0]`):
  - The count lines add to 13 harness sessions: K-1 1, K-2 0, K-3 1, K-4 0, K-5 1, K-6 1, K-7 2, K-8 3, K-9 4, plus planning P-1 0.
  - They match the nine `check-kinds-tier*-*.log` files and the `kinds-tier*` and `red-kinds-tier` rows in `issues/timings.jsonl`.
  - The overrun past the renewed bound of 11 was warned in `implementation/report.md` before K-9 (a repeat-count bound), so it is information and the proof stands.
  - No abandoned capture pair is left in `implementation/`.

## Fixes

### F1: the listener can miss a restarted core and never catch up (criterion 3)

- Realistic source: a real hc core restart of a session the listener follows: `hc server restart`, a core crash and auto-start, or a deploy. The planned criterion-3 test runs this scenario, and its real output was red twice in loaded full-suite runs on this leaf:
  - `check suite-port-start`
  - `check suite-after-port-2: 1 .../check-suite-after-port-2-1794095476865-2231852.log`: `hc-listener.test.ts:73` "timed out waiting on .../passes.log". The log ends with `next --wake` passes, and no `next --resume` followed `hc server restart`.
- Trace:
  1. When a session's stream ends, `src/listen.ts:90-95` marks it for catch-up and calls `scan()`.
  2. `scan()` subscribes only sessions that `sessions()` reports live (`src/listen.ts:117`).
  3. `sessions()` probes each socket with `listening()`, which treats `ECONNREFUSED` as not live (`src/hc.ts:122-131`).
  4. A restarting core creates its socket file at bind, before it accepts connections. A scan that probes in that gap, whether from the stream end or the directory watch event, skips the session.
  5. Nothing later fires another scan for it: no further socket-file event, and no retry.
  6. The session stays unsubscribed, `catchUp` never yields its `next --resume`, and later turn ends in that session wake nothing.
  7. Load widens the gap, which fits red only in full-suite runs and green alone (`check listener-alone-1..3`) and in verify.
- Consequence today: after a core restart, the listener can stop following that session silently. Seats there finish turns, but no engine pass runs, and dispatch stalls until another socket event happens in the same directory. The configured `test` check can also go red at merge from this case.
- Hits: criterion 3 ("catches up after its event stream ends"), a named scenario, and the `test` check.
- Repair direction (for B): after a stream end, keep probing a session whose socket file exists but refuses until it accepts or the file is gone, with a short bounded retry. A one-shot scan is not enough. Show a red-first reproduction (for example, a socket that is bound but refuses for a moment), then the planned listener case green under load.

### F2: `tests/AREA.md` line 18 describes deleted session-reads cases

- Realistic source: this leaf's port of `tests/session-reads.test.ts` (implementation/report.md "9 deleted for removed herdr routing, hook gating …"). The file now holds six cases: capacity, foreign-session vetoes (2), fresh pane read, "a manual next ignores an inherited HC_TERMINAL_ID", and log session.
- The line still says the file checks "hook socket/workspace gating with event-sourced ids, manual-run scope ignoring `HERDR_PANE_ID`, and `logMove` slot-pane attribution".
- Consequence today: an agent using the area index is told that hook gating and `HERDR_PANE_ID` handling exist and are tested. That behavior was removed by D25, so the agent looks for engine paths and tests that do not exist.
- Hits: the implement rule that the diff's stale docs are updated before review (`tests/AREA.md` was edited in 448f66a1 but kept this line).
- Repair: rewrite line 18 to the current cases, keeping the file at 40 lines or fewer.

## Nits

- N1 Criterion 15 names: the report gives the replaced old tests by category and count and points to the commit bodies, which name every deleted case. The report itself does not list the names. Deferred because the names exist in the branch history the report cites. It would become a Fix if a deleted case were found named nowhere.
- N2 Grant-literal key: O3 and the grant name `hc keys enter` for Claude's trust dialog. K-5 sent `down enter` because the real screen had the cursor on "No, exit". This was recorded in the report before the launch, and the effect (answer Yes for the recorded throwaway repo) is the one O3 authorizes. For operator awareness only, since later runs show no dialog.
- N3 agy settings rewrite: the cleanup's first rewrite of `~/.gemini/antigravity-cli/settings.json` re-encoded seven unrelated values (`&` to `&`, same JSON). It was restored right away and recorded in the report. The file now differs from before the run only by the removed agy cwd. Deferred because there is no lasting change. It would be a Fix if the file differed in any other entry.
- N4 `tests/e2e/kinds.e2e.ts` sets `process.env.XDG_RUNTIME_DIR` globally for the in-process transcript lookup. That is fine for a single-test attended tier. Passing the tier runtime in a child process would avoid the global, but nothing fails today.

## Operator actions

None.

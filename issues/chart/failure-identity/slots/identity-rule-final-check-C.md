# Final-shape check: identity rule (round 1) — slot C

Two concrete defects on `[corr]` items:

1. **`## Q1 names`, item 5 `[corr]` (`Signaled:` wording vs `## Q1 names` item 6 and `## Q2 proof` `[corr]`):**
   - Item 5 `[corr]` states: *"A script that died by a signal shows through its nearest ancestor's `Exited with code` line, or the log keeps `(no test name)`."*
   - Both clauses fail when an **unwrapped** fan-out child dies by a signal in the same log where a sibling stream prints `(fail) <title>` or `Exited with code <n>`. In `tamdoma/framework/package.json`, 12 scripts in `framework:verify:core` (`test:motion-probe`, `test:render-satellite`, `hooks:selftest`, etc.) and 23 in `framework:verify:cheap` are direct children of the top-level `bun run --parallel --no-exit-on-error` process, whose outer exit prints `error: script "framework:verify:core" exited with code <n>` with **no** `<chain> | Exited with code` wrapper line. If `hooks:selftest` logs `(fail) alpha` (also failing on base) while `test:motion-probe` logs `test:motion-probe | Signaled: SIGKILL`:
     1. Item 5 contradicts item 6: there is no ancestor `Exited with code` line, yet the reader returns `['alpha']`, not `['(no test name)']`.
     2. Under `## Q2 proof` bullet 1 `[corr]` (*"Only a head whose red names are all real test titles that also fail on the base takes the named branch"*), `['alpha']` takes the **named** branch without reading both logs whole, letting a `SIGKILL`-crashed sibling pass against `issues/chart/known-red-nameless/forks/coverage-rule.md` (`## Taken`: command not killed or crashed).
   - **Fix (either resolves the contradiction):**
     - Keep `Signaled:` excluded by correcting item 5 to *"shows through a wrapper's `Exited with code` line when wrapped, and yields no name of its own (leaving `(no test name)` only when no other stream matched)"* and stating the unwrapped-signal + covered-sibling case under Stated cost; **or**
     - Include `<chain> | Signaled: <SIG>` with `<SIG> !== 'SIGINT'` in item 3 (local `bun v1.4.4` probe on `bun run --parallel` without `--no-exit-on-error` when a child dies by `exit 2`, `SIGKILL`, or `SIGTERM` confirms Bun always aborts healthy siblings with `Signaled: SIGINT`, never `SIGKILL`/`SIGTERM`/`SIGABRT`/`SIGSEGV`).

2. **`## Q2 proof`, bullet 2 `[corr]` (*"a single test or hook"* vs multiple hook timeouts in one completed run):**
   - Bullet 2 `[corr]` says *"a **single** test or hook that timed out inside a run that ended with the runner's own summary"*.
   - In `tamdoma/framework` (`dilutor-rebalance`, run `1704b5ef`), `test:emdash-kit` logged **two** `(fail) (unnamed)` hook timeouts inside one run that still finished with `bun test`'s own summary. Literal `"a single"` disqualifies any completed summary run with two or more timed-out tests/hooks.
   - **Fix:** Change *"a single test or hook that timed out"* to *"test or hook timeouts"* (or *"individual tests or hooks that timed out"*) *"inside a run that ended with the runner's own summary"*.

All other `[corr]` items (`## Q1 names` items 4 and 7, `## Q2 proof` bullet 1, `## Q3 stored names`, `## Q4 existing log outside the grammar`) have no defect.

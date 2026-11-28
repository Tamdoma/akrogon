# Intake: seat-shell-tests

## Scope

Make the akrogon test suite give the same result whoever launches it, when `bun test` is run directly from an agy, pi or codex seat shell. One destination: akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#165

## Source: Tamdoma/akrogon#165

# Direct bun test from a seat shell still sees the seat tool wiring (tool-entry on PATH or BASH_ENV), failing tests/tool-entry.test.ts

Source: Tamdoma/akrogon#165
URL: https://github.com/Tamdoma/akrogon/issues/165

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

On 2026-11-27, slot B of chart `agy-tool-entry` ran `tests/tool-entry.test.ts` directly with the seat's tool wiring present in the caller env:

- `PATH="$HOME/.akrogon/tool-entry:$PATH" bun test tests/tool-entry.test.ts -t "exactly once"` fails at the unwired reference run `r` (placed in `tools/t-<pid>-<start>`), the same failure as #164.
- `BASH_ENV="$HOME/.akrogon/tool-entry/bash-env" bun test tests/tool-entry.test.ts -t "exactly once"` fails at the same line.

agy seats carry the first (PATH), pi and codex seats the second (BASH_ENV). Checked runs (`akrogon run-check`, `akrogon verify`, land) are fixed by 5d425ea8 (#164), which strips the entry dir from the checked env and already leaves BASH_ENV out. This report covers direct runs only.

A second observation in the same area: `src/tool-cgroup.ts` `realBash` skips only the entry dir of the home it is given. Under a seat whose PATH holds `~/.akrogon/tool-entry`, `refreshToolEntry(<scratch home>)` writes `#!/home/ivan/.akrogon/tool-entry/bash` as the "real" bash in the test-rendered wrapper, so test wrappers chain through the host wrapper. Tests pass today; they do not test what they claim.

## Location

`tests/tool-entry.test.ts`, `tests/tool-entry-tracing.test.ts`, `tests/isolation.ts` (preload), `src/tool-cgroup.ts` (`realBash`, `refreshToolEntry`), `src/seat.ts` (`startSeat` wiring).

## Reproduction

The two commands above, run from the akrogon checkout. Frequency: deterministic (slot B, 2026-11-27, issues/chart/agy-tool-entry/slots/map-b.md F5 and F6).

## Expected behavior

The akrogon suite gives the same result whoever launches it, as the preload already does for DISPLAY, XAUTHORITY and WAYLAND_DISPLAY.

## Urgency

Low. An agent that runs `bun test` directly from an agy, pi or codex seat sees a red test that is not caused by its diff. Agents are meant to use `akrogon run-check`, which is fixed. Workaround: run tests through `akrogon run-check`.

## Suspected cause

Supported hypothesis: `tests/isolation.ts` normalizes display names and HOME but neither strips the host `~/.akrogon/tool-entry` from PATH nor unsets BASH_ENV, so a seat's tool wiring reaches every test's spawned `bash`; `tests/tool-entry.test.ts` `scopeScript()` exports `AKROGON_SEAT_CGROUP="$root"` and runs bare `bash`, which the host wrapper then places. For the second observation, `realBash` filters only `resolve(home, 'tool-entry')` for the home passed in, not the host home's entry dir.

Whose view: agent (slots B and C of chart agy-tool-entry).

Files read: tests/isolation.ts, tests/tool-entry.test.ts, src/tool-cgroup.ts, src/seat.ts, src/run-check.ts.

Not inspected: other suites outside tests/ that spawn bash under a seat scope.

Related reports: Tamdoma/akrogon#164 (closed, same mechanism for checked runs, fixed by 5d425ea8). Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-11-25` (limit 20), `"tool-entry BASH_ENV"` (limit 10).

## Agent findings

- tests/isolation.ts already normalizes HOME, TMPDIR, XDG_RUNTIME_DIR, GIT_TEMPLATE_DIR and unsets DISPLAY, XAUTHORITY and WAYLAND_DISPLAY with libc setenv/unsetenv, but leaves PATH and BASH_ENV untouched (inspected 2026-11-28).
- src/tool-cgroup.ts:90 `isToolEntryDir(dir, home)` exists from #164 (5d425ea8); `realBash(home)` at :99 skips only `<home>/tool-entry` for the home it is given.
- learnings/LESSONS.md:61 still holds the active lesson "agy tool-entry PATH leaks into verify and run-check" (history learnings/history/2026-11-27-agy-tool-entry-path-verify.md); #164 stopped the checked-run path, direct runs remain.
- A 2026-11-27 direct watcher-test failure in A's shell was not this issue: it came from a 5 s default timeout leaving scratch hc daemons; with `--timeout=120000` the suite passed.

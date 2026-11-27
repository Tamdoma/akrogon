# Intake: agy-tool-entry

## Scope

Destination: akrogon. Make `akrogon verify` and `checks.test` pass from an agy seat: tests/tool-entry.test.ts must not inherit the seat's `~/.akrogon/tool-entry` bash wrapper. Unblocks the failed charting-guide leaf and every agy-seated leaf on akrogon.

## Provenance

- GitHub: Tamdoma/akrogon#164
- Operator: door message 2026-11-27 (c-akrogon, t126)

## Source: operator 2026-11-27

I just pulled the issue that made charting-guide fail. This has something to do with AGY. Look it up and use manual mode to fix it yourself. Consult with consultants. Use Codex GPT-SOL 6.2 Hi as your reviewer.

## Source: Tamdoma/akrogon#164

# tests/tool-entry.test.ts fails under akrogon verify and run-check when launched from an agy seat (suspected: agy tool-entry dir stays on inherited PATH)

Source: Tamdoma/akrogon#164
URL: https://github.com/Tamdoma/akrogon/issues/164

Origin repo: Tamdoma/akrogon
Lesson history: learnings/history/2026-11-27-agy-tool-entry-path-verify.md

Unverified intake.

## Observation

On 2026-11-27, while running `akrogon verify` and the configured `checks.test` command from an `agy` seat (leaf `charting-guide`, slot A, terminal `t42h`, harness `agy`), 1548 of 1549 tests passed and one test failed deterministically on both `akrogon verify` (commits `47343426` and `dcfd9332`, docs-only diff under `docs/guide/` and `docs/README.md`) and its `akrogon run-check` retry:

```text
tests/tool-entry.test.ts:
141 |     expect(cgOf('r')).toBe(`0::${root.replace('/sys/fs/cgroup', '')}\n`.trim());
                            ^
error: expect(received).toBe(expected)

Expected: "0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/akrogon-tentry.slice/akrogon-tentry-p104618.slice/tentry.scope"
Received: "0::/user.slice/user-1000.slice/user@1000.service/akrogon.slice/akrogon-tentry.slice/akrogon-tentry-p104618.slice/tentry.scope/tools/t-296126-9174273"
(fail) the entry places a bash tool shell exactly once at the scope root and nowhere else
```

`akrogon verify --known-red` on `dcfd9332ed839ab41c4bdeeeb0a7791c5d97faeb` exited 1 (`verify known-red dcfd9332ed839ab41c4bdeeeb0a7791c5d97faeb: fail`) because the merge-base commit `562611bd309252ddcbe7a18a04a88629d0e82c0e` (`tree: 13a9aeb4d9f5f10b345f76b8a304d82c14652cb6`) already has a whole-green merge-scope verify receipt (`ae3e87a6-4e75-4ab3-b166-28e222dc1711`).

Kept logs on commit `dcfd9332ed839ab41c4bdeeeb0a7791c5d97faeb` (base `562611bd309252ddcbe7a18a04a88629d0e82c0e`):
- `verify test: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-test-1795773659995-103283.log`
- `check test: 1 /home/ivan/Work/infra/akrogon/issues/open/builder-docs/charting-guide/charting-guide/implementation/check-test-1795773912547-469711.log`

## Location

`tests/tool-entry.test.ts` (case `"the entry places a bash tool shell exactly once at the scope root and nowhere else"`), `tests/isolation.ts`, `src/run-check.ts` (`constructedEnv`), `src/verify.ts` (`launchPass`), and `src/seat.ts` (`startSeat`). Installed release `/home/ivan/.akrogon/releases/562611bd309252ddcbe7a18a04a88629d0e82c0e/src/akrogon.ts` (matches workspace HEAD `562611bd`).

## Reproduction

1. Run a leaf on the `akrogon` repository whose seat harness is `agy` (so `src/seat.ts` prepends `/home/ivan/.akrogon/tool-entry` to the seat's `PATH`).
2. Run `akrogon verify` or the configured `checks.test` command via `akrogon run-check` from that seat.
3. Observe `tests/tool-entry.test.ts:141` failing because the unwired reference `r` is placed into `tools/t-<pid>-<start>`.

Frequency: 3 of 3 runs from the `agy` seat (`47343426` verify, `dcfd9332` verify, `dcfd9332` run-check retry).

## Expected behavior

Running `akrogon verify` or `checks.test` on `akrogon` from an `agy` seat executes `tests/tool-entry.test.ts`'s unwired reference run `r` without inheriting the host seat's `tool-entry` wrapper, matching runs from non-`agy` seats and `akrogon land`.

## Urgency

Blocks every `agy`-seated leaf on the `akrogon` repository (such as `charting-guide` and `guide-chapters`, configured with `a: { harness: agy, model: neon, effort: high }` in `ISSUE.md`) from obtaining a green `akrogon verify` receipt and moving to `check.review`. `akrogon verify --known-red` cannot clear it while main holds a green receipt from `akrogon land` or non-`agy` seats. Workaround: run `akrogon verify` from outside an `agy` seat (where `PATH` does not contain `~/.akrogon/tool-entry`) or switch the seat harness away from `agy`.

## Suspected cause

Supported hypothesis: `src/seat.ts` (`startSeat`) wires `agy` seats by prepending `<home>/tool-entry` to `PATH` so `bash` resolves to the seat's tool-cgroup wrapper (`PATH=/home/ivan/.gemini/antigravity-cli/bin:/home/ivan/.akrogon/tool-entry:...`). Both `src/verify.ts` (`launchPass`) and `src/run-check.ts` (`constructedEnv`) copy `PATH` verbatim into checked runs, and `tests/isolation.ts` does not filter `<home>/tool-entry` out of `PATH`. Inside `tests/tool-entry.test.ts`, `scopeScript()` exports `AKROGON_SEAT_CGROUP="$root"` and runs the unwired reference shape `OUT="$OUT" N=r bash "$OUT/cmd.sh"` under `{ env: { ...process.env, ...env } }`; because `<home>/tool-entry` precedes `/usr/bin` on `PATH`, `bash` resolves to the real host wrapper `/home/ivan/.akrogon/tool-entry/bash`, which sees `AKROGON_SEAT_CGROUP="$root"` and places `r` into `$root/tools/t-<pid>-<start>`.

Whose view: agent.

Files read: `tests/tool-entry.test.ts`, `tests/isolation.ts`, `src/tool-cgroup.ts`, `src/seat.ts` (`startSeat`), `src/run-check.ts` (`constructedEnv`), `src/verify.ts` (`launchPass`, `verify`, `knownRedReceipt`), and kept check logs on `dcfd9332` (`check-test-1795773659995-103283.log`, `check-test-1795773912547-469711.log`).

Not inspected: other tests that spawn `bash` inside a delegated scope or set `AKROGON_SEAT_CGROUP`; whether `tests/tool-entry-tracing.test.ts` is affected under another tracing case.

Related reports: none found. Searched Tamdoma/akrogon, all states: `--author @me created:>=2026-11-25` (limit 20), `"tool-entry PATH"` (limit 10), `"tool-entry.test"` (limit 10), `"tool-entry"` (limit 10).

## Agent findings

- Door reading: "use manual mode to fix it yourself" means No autopilot (the operator answers the decisions) and the Direct route (the charting agent builds the fix itself). "manual mode" is a retired word; the operator's intent is stated in "fix it yourself".
- Reviewer: the operator names Codex gpt-6.2-sol high; the door creates it as consultant D and passes it to `akrogon direct --reviewer`, replacing the skill's default of B. Operator words win.
- Inspected: src/seat.ts startSeat prepends the entry dir to PATH for agy only (`agyPath`); src/run-check.ts and src/verify.ts pass PATH through; src/tool-cgroup.ts resolves the real bash by skipping PATH entries inside the entry dir; tests/tool-entry.test.ts reference run `r` uses plain `bash` with the inherited env.

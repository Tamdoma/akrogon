# Implementation report: peer-restart

Mode: serial-solo (single unit in plan). Base `AKROGON_BASE` 14ccc59 (origin/main at refresh; fetch+rebase clean, no move). Committed head `4fa309a`.

## Changed files

- `skills/chart-issues/scripts/peer-restart.ts` (new, commit 6aaf284 + 4fa309a): the door command — `peer-restart.ts <root> <A pane> <seat> <pane>...`; reads `herdr agent list` + per-seat `pane process-info` (unique leader via `foreground_process_group_id`, per-kind history-token refusal, derived-name `peer-<a-pane>-<seat>` collision check), then closes in reverse naming order, splits right-of-A 0.65 then below-previous 0.5 with `--cwd <root> --no-focus`, `agent start <name> --kind <kind> --pane <new> -- <argv[1:]>`, prints one JSON line per seat (`restarted`/`closed`/`untouched`), stops all later steps on first failure and exits 0 only when every seat is `restarted`.
- `tests/fake-herdr.ts` (6aaf284): seeded `foreground_processes`, `foreground_process_group_id`, `agent_name` (echoed as `name` by `agent list`), and `closeScript` failure hook.
- `tests/peer-restart.test.ts` (b7d551c red-first at plan.synthesis; 4fa309a prettier-only): 8 tests covering criteria 1–3.
- `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `docs/guide/chart.md` (af9316a): restart trigger set, sole supplied-pane close exception, printed-pane usage, seats.yaml rule, attended/autopilot failure results.

## Proof

| Criterion | Command | Commit | Result |
|---|---|---|---|
| 1–3 | `akrogon run-check --name 'peer-restart tests' -- bun test tests/peer-restart.test.ts` | 4fa309a | 8 pass / 0 fail. `check peer-restart tests: 0 .../check-peer-restart%20tests-1792233440226-814580.log` |
| 4 | `akrogon run-check --name 'criterion-4 doc sweep' -- sh -c 'git grep ...'` | 4fa309a | Rule present in all three files; stale-rule sweep empty outside them. `check criterion-4 doc sweep: 0 .../check-criterion-4%20doc%20sweep-1792233596365-1264474.log` |

Red-first: `check peer-restart tests red: 1 .../check-peer-restart%20tests%20red-1792233180173-357641.log` — 0 pass / 8 fail on missing script (recorded in plan.md).

`akrogon verify` on committed head `4fa309a`: **green** — format 0, test 1020 pass / 0 fail (61 files, 143.75s wall), typecheck 0. Logs under `implementation/check-{format,test,typecheck}-*-815811.log`. Earlier verify on `af9316a` was red: typecheck TS2322 `signalCode` string|undefined → fixed by `?? null` in 4fa309a (no cause in diff beyond the fix itself; tests still green).

## Wall time (minutes-size commands)

- `akrogon verify` test stage: ~2.4 min (143.75s).

## Deviations and limitations

- Mid-implementation product fix (not a test edit): `state.kind` is now filled for every seat with a live agent before refusals, so refusal/failure lines report `kind` whenever it was read; the locked test expectation stands unchanged.
- No live herdr run: close/split/start and argv pass-through are already proven at charting (fork `restart-rule.md` Proofs, readiness proofs); this leaf adds no new live surface.
- `agent start` name check in the fake matches only recorded `starts`; seeded `agent_name` panes are caught by the command's own pre-close check, which is what criterion 2 exercises.
- No operator actions needed; no credentials (`Missing:` empty); no grants used.

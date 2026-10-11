# Sibling breaks Q3, slot C: cheap checks that run only at merge

Blind notes. Read 2026-10-11. LC marks a low-confidence claim.

## Where the gap is, per registered repo
`akrogon config` lists ten repos (`/home/ivan/Work/infra/akrogon/config.yaml:17-27`). Their `issues/config.yaml`, read 2026-10-11:

- framework: `checks` parity, contracts, test, test_changed, selftest (`:8-13`); `merge_checks.verify: bun run framework:verify` (`:14-15`); `merge_covers` names every leaf check (`:16`). `framework:verify` runs the root-state guard, then stage `fast` (`framework:verify:cheap` then `hooks:selftest`), then `core` (`package.json:167,168`). `cheap` holds `hooks:typecheck`, `skills:typecheck`, `fingerprint:typecheck`, `lint` and the validators (`package.json:163`). So typecheck and lint run only at merge. This is the only repo with the gap.
- akrogon (format, test, typecheck), boulevard-automation (typecheck, test), lens (typecheck, lint, test), Himne (check, test), blepsis (test, typecheck; `merge_checks: {}`), pi-extensions (test): no `merge_checks`, so every check already runs in the leaf and again at merge. No gap.
- clinique-la-roya: framework's five leaf checks copied, no `merge_checks`. Typecheck and lint run nowhere, if the repo has them (LC, scripts not read).
- mdcny-ghl-data-pulls and lingua-relay: `checks: {}`. Nothing runs anywhere.

Merge attempts in framework take 7 to 12 minutes end to end (`framework/issues/merge-attempts.jsonl:14-19`, start to end), with `framework:verify` inside; the cheap stage's own time is not recorded (LC, likely one to three minutes since `hooks:selftest`, 3540 tests, already runs per leaf).

## 1. Pick
A framework config change, operator step on main (`skills/chart-issues/assets/shapes.md:284`): the leaf `checks` run the same cheap stage the merge runs, by naming the stage, not its scripts. `checks.test: bun run framework:verify:cheap`, `checks.test_changed` the same command after the `AKROGON_BASE` guard, drop `parity` and `contracts` (both are inside `cheap`, `package.json:163`), keep `selftest`, and `merge_covers: [test, test_changed, selftest]`. Nothing in akrogon code. The exact key names belong to framework's merge-flow chart, which owns its test specifics; the shape is what this fork takes.

Reason. A runs every `checks` command before the first slow run and again before handoff (`skills/implement-issue/SKILL.md:41,63`), B runs them after repairs (`skills/check-issue/SKILL.md:88`), so F16 and F17 (`formspark-build-wiring/review-B.md:482-483`) would have stopped at implement end, seconds in, instead of after a review and a 7-minute merge. Naming the stage means any script the framework later adds to `cheap` is covered in the leaf with no config edit, and the leaf and the merge cannot drift apart because they run one definition. The rule akrogon already states is kept, not extended: `merge_checks` "lists slow commands that run only at merge" (`docs/guide/setup.md:54`, `skills/init-akrogon/SKILL.md:20`). The framework config broke that rule by packing cheap checks into the slow command; the fix is to unpack them where the rule says they go.

Cost. Each A proof and each B repair pass in framework runs the cheap stage once more than today (LC on minutes). The config edit lands as a records commit, and a config move forces a full re-check on any merge in flight (`recordConfigEqual`, `src/phase.ts:669`), once.

## 2. Rejected
- O1 akrogon enforces "every `merge_checks` command also runs in `checks` or is declared slow". Akrogon cannot tell cheap from slow without timing it, which is a clock the lock forbids (`seat-stall-detection/CHART.md:15`); a `slow:` declaration is a self-report with a new schema key (`src/config.ts:49-51`) and gives no guarantee the doc sentence does not already give. More complexity, same hole.
- O2 Akrogon runs `merge_checks` in the leaf too. Makes every A pass a 7 to 12 minute merge run in framework, the opposite of the question's constraint, and still runs the whole of `verify` to get two minutes of it.
- O3 Add only `cheap: bun run framework:verify:cheap` beside the existing keys. Works, but parity and contracts then run twice per pass (inside `cheap` and as their own keys). Fewer keys is the better shape; the framework chart decides.
- O4 List typecheck and lint scripts individually in `checks`. Drifts from `verify:cheap` the first time the framework adds a validator to the stage; naming the stage removes that class.
- O5 Change init-akrogon to propose `merge_checks` differently. Init already says slow full-suite commands only (`SKILL.md:20`); the framework config was not produced by init in this shape. No text to fix.

## 3. Evidence
- Operator: "the testing for these should come first, not wait till the end" (INTAKE.md, operator-forwarded chart-framework notes, in substance); "I don't want more complexity". Read 2026-10-11.
- Practitioner, forwarded F5 to F7 and the Ask (`issues/chart/red-base-wait/slots/from-chart-framework.md:26-46` as quoted in INTAKE.md), read 2026-10-11.
- Practitioner, configs: `framework/issues/config.yaml:8-16`, `framework/package.json:163-168,173,19,8`, and the nine other `issues/config.yaml` files listed above; akrogon `config.yaml:17-27`. Read 2026-10-11.
- Practitioner, schema and rule: `src/config.ts:49-51,84-96` (`merge_covers` names must exist in `checks`; non-empty `merge_covers` needs `merge_checks`), `docs/guide/setup.md:53-55,69`, `skills/init-akrogon/SKILL.md:20,29-31`, `skills/implement-issue/SKILL.md:41,63,68`, `skills/check-issue/SKILL.md:88`, `skills/merge-issue/SKILL.md:41,71`. Read 2026-10-11.
- Practitioner, durations: `framework/issues/merge-attempts.jsonl:14-19`. Read 2026-10-11.
- Lock: config changes are operator steps on main, never a leaf (`skills/chart-issues/assets/shapes.md:284`, as carried). Read 2026-10-11.

## 4. Pitfalls
- R1 `merge_covers` not updated with the renamed keys: the schema refuses unknown names (`src/config.ts:84-89`), so the error is immediate, not silent.
- R2 The uncommitted `fix_rounds: 8` stopgap sits in the same file (`framework/issues/config.yaml:5`). Make one edit: revert the stopgap (moot after S2) and change the checks, so one records commit carries a config the Taken agrees with.
- R3 The config commit reaches origin only through a push. Records-sync (keep-running Taken R) will carry it at the next merge or startup; until then the door's refused `akrogon sync` leaves it local. Push it with the edit.
- R4 `framework:verify:cheap` runs under `--no-exit-on-error` and the stage wrapper decides the exit code (`package.json:163,167`). Run `checks.test` once in a leaf worktree with a known lint error to prove the command exits non-zero on its own, outside `run-verify-stages`. If it exits zero, the stage needs a wrapper or the individual scripts after all.
- R5 The root-state guard wraps only `framework:verify` (`package.json:167`); the cheap stage run alone in a leaf worktree has no guard. That is correct for a leaf (its worktree is its root), and the guard still runs at merge.
- R6 Drift in the other direction: if the framework later moves a slow script into `cheap`, every leaf pass slows. The stage name makes that visible in one place (`package.json:163`) and the framework chart owns it.

## 5. Questions Q3 does not ask
- Q3a Two repos run no check at all (`mdcny-ghl-data-pulls`, `lingua-relay`, `checks: {}`), and clinique-la-roya mirrors framework's leaf checks without `merge_checks`, so its typecheck and lint, if present, never run. Same class as Q3, worse outcome: is an audit of every registered config one operator pass now?
- Q3b Does B's `check.review` run `checks` itself, or only read A's evidence? If it only reads, the leaf-side guarantee rests on A's proof run alone, which is fine for cheap checks but should be said in the Taken.

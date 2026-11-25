# caller-display review B

- Base: `8d0df9dd2cc0274401346de5fb89ccc48174f570`
- Reviewed head: `5530b6c86f0ec18a5c9290d1f3bc064d736a482f`
- Verdict: `fix`

## Fixes

**F1. Prove the exact held `XDG_RUNTIME_DIR` with empty `env` and `pass_env`.** A desktop caller running a Wayland check in a repo without either declaration relies on the caller's runtime path to find the compositor socket. A caller holding an empty runtime value also falls under criterion 1's explicit empty-value rule. The criterion 1 test at `tests/display-env.test.ts:47` always drops the variable. The exact held-value test at line 74 lists it in `pass_env`, and the blank check at `tests/run-units.test.ts:297` declares it in `env`. The allow-list assertion at `tests/run-check.test.ts:196` only checks presence under the pinned suite environment. The direct copy could substitute a different nonempty path or drop an empty value for an undeclared runtime variable while all these assertions pass. Add held nonempty and held empty inputs to the existing criterion 1 CLI proof, and show that breaking the automatic copy turns it red.

**F2. Give the lesson retirement a resolvable line or commit reference.** The implementation appended `by src/run-check.ts displayEnv/copied` at `learnings/history/2026-11-24-run-check-drops-display.md:23`. A reader auditing the retired #155 lesson gets a file and two symbols to search for. Criterion 5 requires a reference to the actual fix by file and line or commit. The stopping change is `f024825c`, with the shared list at `src/run-check.ts:52` and its inclusion in `copied` at line 63. The active line removal and the mechanism that replaced it are present.

## Verification

- Completed green leaf receipt `9465afdc-8c3a-416c-a6a7-e44d57c74568` in `issues/verify-runs.jsonl` matches the reviewed SHA, tree and configured commands. Setup, format, typecheck and test each exited 0. Read the receipt logs with `akrogon log`. The configured test command reports 1,439 passes, then 210 passes across the two changed test files in the five-repeat run, with zero failures.
- Read the planned `crit1-display`, `crit2-passenv`, and all four `crit3-*` green logs cited in the implementation report. Each selected its planned test. The held verify test exercises both configurations, and the absent verify and both land cases inspect the launched argv. The red-first `check crit-display-red2: 1 implementation/check-crit-display-red2-1795592810396-1697074.log` confirms the dropped display values and missing verify unset flags on base. The kept deliberate-break logs exercise the bus cut, two excluded variables, reserved-name compatibility, land unset and runtime flags, and preload determinism.
- The receipt and planned green evidence ran after the last test, helper and fixture changes. The range changes no runner, selector or skip configuration. The implementation report records no proof-command correction. No paid sessions appear in the evidence.
- Read the affected `docs/reference/checks.md` and `docs/reference/config.md` paragraphs and followed the docs index and command reference. The paragraphs meet criterion 4, and `check crit4-docs-links: 0 implementation/check-crit4-docs-links-1795594128047-3631063.log` shows 14 passes. Checked the paths enumerated by `tests/AREA.md` from the worktree root. `tests/budget.test.ts` was already missing at base. The two `issues/` record paths are outside the sparse worktree and present in the tracked tree. The edited preload pointer resolves to `tests/isolation.ts`.
- Read the recorded chart probes and the real CLI and service-argv tests against the design. The reviewed proofs establish environment transport and argv, with a headed browser launch through the changed CLI outside the locked proof.

## Test-Change trailers in origin/main..HEAD

- `5f699994` — `Test-Change: tests/isolation.ts preload unsets DISPLAY/XAUTHORITY/WAYLAND_DISPLAY for deterministic caller display state; no existing expectation changed`. Valid against design's preload requirement and D4. The kept `crit-viol-preload` log shows a desktop Wayland value reaching the negative case without this change.
- `fd950485` — `Test-Change: tests/run-check.test.ts done-criterion 1 correction pre-authorized as plan decision D5; expectation updated for the copied display names`. Valid against criterion 1 and D5. `pick-u1-changed` shows the old allow-list failing once the feature supplies the suite runtime name, and `d5-allowlist` and the final receipt pass with the updated expectation.
- `5530b6c8` — `Test-Change: tests/AREA.md isolation preload display-state note; doc content only, no expectation changed`. Valid against D7 and the implemented preload. `src/test-files.ts` includes the `tests` path segment regardless of file suffix.

The new `tests/display-env.test.ts` file is an addition. The citation gate covers modified, deleted and type-changed paths.

## check.repair, 2026-11-25

- **F1 repaired in `74b92856`.** Brief criterion 1 and design binding decisions 1 and 2 require the exact caller value with empty `env` and `pass_env`. The existing Bun test, `fixture()`, `cli()` and shell probe previously used only an unset runtime directory. They now also use `''` and `/run/user/4242` with the existing assertions and absent case preserved. Temporarily excluding only `XDG_RUNTIME_DIR` from `copied` made both added cases receive `<unset>`; the absent case still passed. `check crit1-display-break-runtime: 1 implementation/check-crit1-display-break-runtime-1795594806409-4023159.log`. With the original product code restored, the planned selector passed all three cases on `2f4fad18`. `check crit1-display: 0 implementation/check-crit1-display-1795594834286-4028016.log`.
- **F2 repaired in `2f4fad18`.** Criterion 5 now cites `src/run-check.ts:63` in place of `src/run-check.ts displayEnv/copied`. The cited line includes `displayEnv` in the automatic copy list. The branch diff shows the active lesson removed and the corrected `Applied` line added.

Reran the other planned proofs in the changed test file on `2f4fad18`. Each passed its selected case.

- `check crit2-passenv: 0 implementation/check-crit2-passenv-1795594834283-4028018.log`
- `check crit3-verify-held: 0 implementation/check-crit3-verify-held-1795594834614-4028021.log`
- `check crit3-verify-unset: 0 implementation/check-crit3-verify-unset-1795594834431-4028019.log`
- `check crit3-land-held: 0 implementation/check-crit3-land-held-1795594834337-4028017.log`
- `check crit3-land-lacking: 0 implementation/check-crit3-land-lacking-1795594834337-4028020.log`

Criterion 4 retains its green proof. Its docs and test inputs did not change in the repairs. All repair checks were local and free.

`akrogon verify` produced green leaf receipt `e8cbf8f2-48c5-4f86-a7ac-14c01c486b2b` on `2f4fad18a748d5a7b8c38197925bdd8e0c3e317c`. Setup, format, typecheck and test exited 0. The kept `implementation/check-test-1795595159312-4061958.log` reports 1,441 suite passes and 220 changed-file repetitions, with zero failures.

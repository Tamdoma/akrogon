# Implementation report: cli-help

Base: a33d967b5dd07829b81b9dd87802c8a72f8effbd. Head: 43a3d7a75ad7b1219ced4328618dad3f49fe131e. Branch: cli-help, clean. Delegated mode, wave [U1, U2] ran two workers in worktrees cli-help-u1 and cli-help-u2; both removed after cherry-pick.

## Commits

- c8075967 `test: assert help answers, unknown-flag and --since form errors at the CLI boundary` — tests committed first, per plan (A, plan.synthesis).
- ae088dea `feat: answer --help, name unknown flags, and print timing usage at the CLI boundary` — U1 worker, cherry-picked from e0736135.
- 36c76b13 `docs: state the --help and unknown-flag behavior` — U2 worker, cherry-picked from c4ed6540.
- 7bfb1ca6 `fix: derive the verb list from VERB_OPTIONS` — A's two-line repair: the worker wrote `VERB_USAGE` as a literal, splitting D1's single source; now derived from `Object.keys(VERB_OPTIONS)`, output identical.
- 43a3d7a7 `style: prettier-format the cli-help tests` — `Test-Change:` trailer, formatting only, no expectation changed.

## Changed files and reasons

- `src/usage.ts` (new) — `VERB_OPTIONS` for the 30 public verbs (no `verify-pass`, per D3), `USAGE_LINES`, the six usage constants, `optionsFor`, `verbFlags`, `helpText`, `VERB_USAGE` derived from `VERB_OPTIONS`.
- `src/akrogon.ts` — `--help` verb-list exit, parseArgs under `optionsFor`, `ERR_PARSE_ARGS_UNKNOWN_OPTION` reformatted to one stderr line with exit 1, `values.help` exit 0, all before `migrateStateHome()`; timing `mode` parse catches `z.ZodError` → `TIMING_USAGE` on stderr exit 1; pack/stop/default literals use the constants.
- `src/guard.ts`, `src/run-check.ts` — inline usage strings replaced by `GUARD_USAGE`/`RUN_CHECK_USAGE` imports.
- `docs/reference/commands.md` — one intro sentence for `--help` and the unknown-flag error; table untouched.
- `tests/cli-help.test.ts` (new at c8075967, formatted at 43a3d7a7) — the criterion proofs.

## Commands and results

- `akrogon run-check --name u1-tests -- bun test --timeout 30000 tests/cli-help.test.ts` (worker u1) → `check u1-tests: 0 …/check-u1-tests-1794392937074-3701795.log` — 7 pass.
- `akrogon run-check --name u1-pick -- bun test … cli-help.test.ts` after the U1 pick → `check u1-pick: 0 …/check-u1-pick-1794392946598-3743711.log` — 7 pass.
- `akrogon run-check --name u2-pick -- bun test … command-reference.test.ts docs-links.test.ts` after the U2 pick → `check u2-pick: 0 …/check-u2-pick-1794392948195-3763542.log` — 12 pass.
- `akrogon run-check --name final-tests -- bun test … cli-help command-reference docs-links guard` on head before the format fix → `check final-tests: 0 …/check-final-tests-1794392965891-3821283.log` — 26 pass.
- `akrogon verify` on 7bfb1ca6 → red: format check flagged `tests/cli-help.test.ts` prettier drift; typecheck green; test blocked by format. Repaired by the prettier commit.
- `akrogon verify` on 43a3d7a7 → `verify leaf 43a3d7a7…: green`; setup 0, format 0, typecheck 0, test 0 (`check-test-…-1794393077603-3928523.log`, 1159 pass in ~59 s; wall time ~1.5 min including setup).

## Done-criteria proof

1. `every public verb answers --help…` iterates `VERB_OPTIONS` keys, asserts each declared flag printed, each printed `--flag` declared, usage line where `USAGE_LINES` holds the verb — green in `check final-tests: 0` on 7bfb1ca6 (same expectations, only formatting differed at 43a3d7a7) and inside verify's test run on 43a3d7a7.
2. `akrogon --help prints the verb list…` — green, same run; bare `akrogon` still errors.
3. `an unknown flag exits 1…` — green, same run; `--help --bogus` exits 1 naming `--bogus`; `-h` named.
4. `a wrong --since form…` — green, same run; designed forms stay proven by `tests/timing-report.test.ts` (inside verify test, green).
5. `help and the unknown-flag error do no work…` — green, same run: empty home unchanged, `stopped.yaml` never written.
6. `a --help after -- reaches the child…` — green, same run: probe holds `--help`.
7. `errors that are not unknown flags…` — green, same run: missing-value TypeError with frame, ZodError shape error, `Missing leaf` runtime error all unchanged.

## Grants and env

No grants, no paid or live operations; worker launches are the configured `implement: subagents` mode and draw on no grant bound. `akrogon status` showed no `Missing:` lines.

## Known limitations

Help shows positional shapes only where a `Usage:` line already exists (design-foreclosed). `verify-pass --help` is refused because `verify-pass` is internal and stays out of `VERB_OPTIONS`. Other parse errors keep their frame — only `ERR_PARSE_ARGS_UNKNOWN_OPTION` is formatted.

## Unverified criteria

None. All seven criteria are green on head 43a3d7a7.

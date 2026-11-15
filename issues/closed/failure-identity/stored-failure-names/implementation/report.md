# Report: stored-failure-names

Base `ec988c5c` (origin/main at pass start; branch already current, no rebase move). Head `d44920b8` (after check.fix repair; implement head `b73a4cef`, check.repair F2 commit `01f71d9a`). Delegated run: wave 1 = {U1, U2}, workers `stored-failure-names-u1` and `-u2`, both landed and worktrees removed.

## check.fix repair (F1, handed to A)

- `tests/verify.test.ts` (d44920b8, `Test-Change` citing the finding): added `a verify-written red run flips to green on the same tree and flaky reports the stored name after its log is gone` — the real producer-to-consumer chain criterion 2 names: `akrogon verify` writes the red run, a same-tree green follows, the red log is removed, `flakyLines` and `akrogon flaky` report the stored `alpha`, never `(log gone)`.
- Reruns after the repair: `check checkfix-targeted: 0` (all eight verify.test.ts criterion cases), `check checkfix-c5: 0` (7 pass). `akrogon verify` on `d44920b8` green: format 0, typecheck 0, test 0 — 1178 tests; receipt under `issues/verify-runs.jsonl`. Refresh before and after: branch already current.
- F2 was repaired by B in `01f71d9a` (AREA.md now states the entry exclusions and older-version parse cost).

## Changes

- `src/verify.ts` (ace4ce40, worker U1): `verifyRunSchema` command entry gains optional `failures` (`min(1)`, dedup refine). `runOnce` stores `await failedTests(repo, log)` at the two own-`checkedRun` sites (sequential push, `merge_checks` member push) when `code !== 0` and the list isn't `['(log gone)']`. `newRedUnits` reads `item.failures ?? failedTests(...)` at both sites. `knownRedReceipt` untouched.
- `src/flaky.ts` (ace4ce40): `Red` widened to the entry type; `flips` reads `prior.failures ?? failedTests(...)`.
- `docs/reference/files.md` (53481402 + b73a4cef): `verify-runs.jsonl` row and Flaky report sentence state the field, readers, never-read and older-akrogon parse cost; b73a4cef reverts U2's unneeded table re-padding (docs are outside the format check's file set).
- `src/AREA.md` (53481402): verify bullet and rewrite bullet state the field.
- `tests/verify.test.ts` (6d0541e1 + 6e7c003e) and `tests/flaky.test.ts` (6d0541e1): planned criterion tests, both with `Test-Change` trailers.

## Test corrections by A (6e7c003e, cited exceptions)

- `red` check was `sh -c "echo \"(fail) gamma\"; exit 7"` — checkedRun already wraps in `sh -c`, so the inner quoting broke (exit 2). Corrected to `echo "(fail) gamma"; exit 7`; cited real output: worker-observed exit 2.
- The `beta` notice stage reran `--known-red` on the same worktree: its merge-base predates the `beta` push, so no base run could ever print `beta`. Corrected to create `callerWorktree(f, 'after-beta')` after the push. `later` member expectation was set at planning to `['(no test name)']` after E1 output showed `echo later` produces no Bun lines.

## Commands run and results

Grant count lines: no paid or live operations; `grants: []`. All kept output via `akrogon run-check` under `<leaf>/implementation/` or `akrogon verify`.

| Proof | Command | Commit | Result |
|---|---|---|---|
| C1 writer | `bun test tests/verify.test.ts --test-name-pattern 'stores its failure names|stores its script name'` (inside impl-targeted) | b73a4cef | `check impl-targeted: 0` — 6 pass |
| C2 flaky | `bun test tests/flaky.test.ts --test-name-pattern 'stored failures name'` | b73a4cef | `check impl-flaky: 0` — 1 pass |
| C3 notices | inside impl-targeted | b73a4cef | pass |
| C4 receipt/CLI | inside impl-targeted | b73a4cef | pass |
| C5 old rows + schema shape | `bun test tests/flaky.test.ts tests/verify.test.ts --test-name-pattern 'receipt schema|flaky'` | b73a4cef | `check impl-c5: 0` — 6 pass |
| C6 docs | `sh -c "grep -nF '\`failures\`' docs/reference/files.md src/AREA.md" && bun test tests/docs-links.test.ts` | b73a4cef | `check impl-c6: 0` — hits at files.md:71,93 and AREA.md:17,31; 12 pass |
| Full checks | `akrogon verify` | b73a4cef | green; `verify leaf b73a4cef…: green`, receipt `c4a0e3a4` (format 0, typecheck 0, test 0 — 1177 tests) |

Wall time for minutes-sized commands: `akrogon verify` ~2 min total (test check 60.7s); targeted runs under 1s each. Refresh: `git fetch` + rebase run at pass start and after landing; branch was already current both times.

## Worker returns folded

- U1 (bddfae8b → ace4ce40): implementation as listed; returned two test mismatches, both confirmed and corrected in 6e7c003e (above).
- U2 (fbb5d73 → 53481402): doc edits correct; its prettier re-padding of `files.md` tables was reverted in b73a4cef as out-of-scope drift (format check covers only src/tests/skills paths, file was prettier-unclean on HEAD).

## check.fix proof table

| Proof | Command | Commit | Result |
|---|---|---|---|
| C2 chained | `bun test tests/verify.test.ts --test-name-pattern 'flips to green'` | d44920b8 | `check checkfix-c2: 0` — 1 pass |
| C1/C3/C4 + C2 | inside checkfix-targeted | d44920b8 | `check checkfix-targeted: 0` — 8 pass |
| C5 | `bun test tests/flaky.test.ts tests/verify.test.ts --test-name-pattern 'receipt schema|flaky'` | d44920b8 | `check checkfix-c5: 0` — 7 pass |
| Full checks | `akrogon verify` | d44920b8 | green, 1178 tests |

## Known limitations

- A ledger written by this change is unparseable by an older akrogon (`unrecognized_keys`) — the stated cost, documented in files.md.
- Rows written before this leaf keep no `failures` and read names from logs as before; logs already gone stay `(log gone)` by design.

## Unverified criteria

None. C1–C6 all have green proof on the committed head.

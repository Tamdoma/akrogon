# Implementation report: trailer-rule-refusal

Serial-solo run (plan.md D4): one unit, implemented by A, no workers.

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc` (AKROGON_BASE, unchanged after refresh — fetch + `git rebase origin/main` was a no-op).
Committed head: `ae0c6701` `phase: share one citation refusal that states the one-line writer form`.

## Changed files

- `tests/phase.test.ts` — one new case `a flush-left wrapped Test-Change trailer is refused and the refusal states the one-line writer form` (commit `53659165`, `Test-Change:` trailer carried). Written at plan.synthesis, shown red before product code.
- `src/phase.ts` — new `citationRefusal(missing: string[]): string` builder; both `requireTestChangeCitations` and `requireFrozenCitations` now `throw new Error(citationRefusal(missing))` (commit `ae0c6701`). New shared text: `Changed test files need a citation:\nTest-Change: <path> <source and reason> (per missing path)\nAdd each citation as one line to the final trailer block, the commit message's last paragraph holding only trailer lines; a later empty commit may carry it.` Keeps `final trailer block` and `a later empty commit may carry it`; contains no `indent`/`fold`/`wrap` wording and no claim a wrap happened. git stays the only reader — `citedPaths`/`emptyCommitTrailerValues`/`trailerValues` unchanged.

## Done-criteria

1. Wrapped-trailer refusal names the path and the one-line writer form; one-line empty-commit repair passes.
   Proof: `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'` on `ae0c6701` → `check criterion-1: 0` (`check-criterion-1-1794955989770-1602555.log`). Red-first on `53659165` failing only at `toContain('one line')` (plan.md red-run records). ~1.4 s.
2. Frozen-citation refusal prints the same shared text; no existing test edited; `test` check passes.
   Proof: `requireFrozenCitations` line 639 is `throw new Error(citationRefusal(missing))` — one builder, identical text by construction (read in `src/phase.ts` diff). Configured `test` green under `akrogon verify` run `7ab87938` rerun below → `verify test: 0` (`check-test-1794956587041-3424887.log`); tests diff adds only the new case.
3. Statements: the refusal now gives the writer form (`Add each citation as one line to the final trailer block, the commit message's last paragraph holding only trailer lines`). Whether the framework lesson `history/2026-10-24-test-change-trailer-single-line.md` retires is the framework's call. Its added-path half is untouched — this leaf made no change to `requireFrozenCitations`' added-path logic, only the shared message.

## Commands run

- `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'` — plan-time red: `check criterion-1: 1` (`check-criterion-1-1794955930801-1552458.log`), then green: `check criterion-1: 0` (`check-criterion-1-1794955981862-1592019.log`, uncommitted) and `check criterion-1: 0` on `ae0c6701` (`check-criterion-1-1794955989770-1602555.log`). ~1.4 s each.
- `akrogon verify` on `ae0c6701` — run `7ab87938`: setup 0, format 0, typecheck 0, **test 1** (`check-test-1794956179205-1610104.log`; ~94 s, 2 fails: `dispatch recreates a deleted .env file...`, `agy: the reset helper...`).
- Retry, same configured command via `akrogon run-check --name 'test'` — `check test: 1` (`check-test-1794956365622-2386822.log`; ~60 s, 1 fail: `unpause relaunches closed seats with the current seat config`, a different test).
- `akrogon verify --known-red` on `ae0c6701` → `fail` instantly: a whole-green base row exists at merge-base `39e203a7`, so no cover is possible (green base never covers a red head).
- `akrogon verify` on `ae0c6701` — run `7ab87938` (new pass): setup/format/typecheck/test all 0, 1225 pass 0 fail (~57 s test stage) → `verify leaf ae0c6701: green` (`check-test-1794956587041-3424887.log`).

## Red-check judgment record

- Cause in leaf's diff: none. Diff is `src/phase.ts` (message builder) + `tests/phase.test.ts` (one added case); all three failing tests live in `tests/next.test.ts`, `tests/door-reset.test.ts`, `tests/pause.test.ts` — unrelated dispatch/harness timing paths, each named a real test title.
- Retry: red on a different single test → kept repair path, then `verify --known-red` exit 1 (`fail`): base at merge-base already whole-green, no linked base comparison, no cover. Recorded per the disagreement clause.
- Resolution: a same-tree green `akrogon verify` followed (receipt for `ae0c6701`). Earlier reds are `inconsistent` with their logs cited above; `akrogon flaky` already lists `agy: the reset helper...` as flaking 4x on 2026-11-17, and three reds showed three different single tests while host load was ~18–30 from concurrent suite runs. This leaf files no base red: the judgment found no cover, and a green retry marks `inconsistent`, not a base defect.

## Refresh record

- `git fetch origin` + `git rebase origin/main` before the unit: no-op, already on tip. Prior head `53659165`, new head after commits `ae0c6701`; base `39e203a7` unchanged; AKROGON_BASE re-read unchanged.

## Grants / credentials

None consumed. `akrogon status` showed no `Missing:` lines; the design names no credential.

## Known limitations / unverified

- None. Writer-form sufficiency of the refusal text is review-seat judgment (see check.fix record below); B judged it sufficient in review-B.md.

## check.fix 2026-11-18 — F1 repair

B's only Fix (review-B.md): remove the `toContain('one line')` prose gate, record criterion 1's model-choice reading, rerun proof. Model-choice reading recorded in `plan.md` `## Implementation notes` (2026-11-18): the phrase was A's autopilot pick with no independent one-right-answer source; locked results (refusal, named path, one-line empty-commit repair) unchanged; the writer-form judgment stays with the reviewing seat.

- Refresh at check.fix open: prior reviewed base `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`, prior reviewed head `ae0c6701`; handed-off base `868cac1b071ea34adf5e5e58e89dc2f8192714a3` (origin/main moved: worker-stash-rule landed), handed-off head `ea29445e`; rebase clean, AKROGON_BASE refreshed to `868cac1b`.
- Repair commit `64dbcf93` `tests: drop the one-line prose gate from the wrapped-trailer refusal test` — removed the `one line` assertion, renamed the case to `a flush-left wrapped Test-Change trailer is refused and a later empty commit carrying the citation repairs it`; `Test-Change:` trailer cites review-B.md F1.
- Before commit: `ae0c6701` (product); repair head: `64dbcf93`.
- Proof rerun (inputs changed — the test file): `akrogon run-check --name 'criterion-1' -- bun test tests/phase.test.ts -t 'wrapped'` → `check criterion-1: 0` (`implementation/check-criterion-1-1794956831474-143769.log`), 1 pass on uncommitted repair tree.
- `akrogon verify` on committed head `64dbcf93`: setup/format/typecheck/test all 0, 1225 pass 0 fail (~57 s test) → `verify leaf 64dbcf93: green` (`implementation/check-test-1794956898063-144453.log`).
- Criterion 2 unchanged: one `citationRefusal(missing)` builder at `src/phase.ts:578` serving both throw sites (`575`, `640`); `test` check green above.

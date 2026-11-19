# review-A: trailer-rule-refusal (initial, blind)

Base: `39e203a79c5c4ebeef51d1e76a3d8ea43389debc`. Reviewed head: `ae0c6701`. Diff: `src/phase.ts` (shared `citationRefusal` builder, both throw sites) + `tests/phase.test.ts` (one new case, `53659165` with `Test-Change:` trailer).

## Criterion checks

1. Wrapped trailer refused, path named, one-line writer form, one-line repair passes — covered by the new case, `check criterion-1: 0` on `ae0c6701` (`implementation/check-criterion-1-1794955989770-1602555.log`), red-first on `53659165` failing only at `toContain('one line')` (plan.md red records, `check-criterion-1-1794955930801-1552458.log`). Assertions match the locked scope: refusal, path, `one line`, never the sentence. The fixture message reproduces the real wrap shape (flush-left continuation, no blank line); git probe in plan.md shows it yields zero parsed trailers.
2. Frozen-citation refusal prints the same shared text — `src/phase.ts:640` is `throw new Error(citationRefusal(missing))`, one builder, identical text by construction. No existing test edited (diff adds only the new case). `test` check green: `verify test: 0` on `ae0c6701` (`check-test-1794956587041-3424887.log`), 1225 pass.
3. Report statements — all three present in `implementation/report.md` criterion-3 block, including the framework's-call framing and untouched added-path half.

## Text audit (reviewing-seat read of the full refusal)

`Add each citation as one line to the final trailer block, the commit message's last paragraph holding only trailer lines; a later empty commit may carry it.` — names each missing path via `missing.map`, states the one-line writer form, keeps `final trailer block` and the empty-commit escape, advertises no indented folding, claims no wrap. git remains the only reader (`citedPaths`/`emptyCommitTrailerValues`/`trailerValues` untouched). Writer docs (`docs/reference/checks.md`, skill lines) unchanged per design; they state the same rule, none stale — no documented behavior changed.

## Verification audit

- Red-check trail: two earlier `test` reds (different unrelated dispatch/harness tests each run, `check-test-1794956179205` and `check-test-1794956365622`), one `run-check` retry, `verify --known-red` `fail` on a whole-green base row, then same-tree `verify` green. Report records both logs and marks the reds `inconsistent`; `akrogon flaky` already lists the `agy reset helper` test flaking 4x on 2026-11-17. No cover claimed, no base red filed — a green retry is not filed per the rule. Verdict receipt for `ae0c6701` stands green.
- No paid or live launches; count audit trivially clean. Commit `53659165` carries the `Test-Change:` trailer the trailer rule requires for a test-file change; the src commit needs none.
- No AREA.md in the diff; plan names no doc edits, and docs are not stale.
- Test is at the real boundary (the `akrogon phase` CLI) and mocks nothing; one deliberate-break proof ran at planning (`check-cond-path-1794955936759`).

## Findings

None. No Fix, no Nit, no Operator actions.

## Verdict

`ready` — all three done-criteria shown on the reviewed head with kept evidence.

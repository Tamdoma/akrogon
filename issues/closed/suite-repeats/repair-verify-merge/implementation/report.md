# Report: repair-verify-merge

Serial-solo run (plan D1–D4, one unit). Base: `f7ddb693` (origin/main). Committed head: `de57a744`.

## Commits

- `ff308510` test: prove check.repair to check.fix moves without a leaf receipt — extends the gate test in `tests/receipt-gates.test.ts` with a `handed` leaf asserting `check.repair → check.fix` exits 0 with no receipt and lands in `check.fix`; retitled; `Test-Change` trailer (plan D2).
- `de57a744` docs(check-issue): run the check.repair verify only on the merge move — `skills/check-issue/SKILL.md` "After repairs" paragraph: the `akrogon verify` clause is now conditioned on the `merge` move, with `check.fix`/`failed` running none; sweep and per-Fix evidence paragraphs unchanged; `tests/AREA.md` line 17 names `check.repair` (plan D1, D4).

## Proofs

- Criterion 1 (prose): observed by the check.review walk per plan — pure handoff `issues/closed/repeat-calls/fewer-repeat-calls/review-B.md` (2026-10-26), mixed repairs `issues/closed/killed-run-fixture/abandoned-capture-stop/review-B.md` (2026-10-28), and a merge-finishing check.repair entry. Diff confined to the one paragraph: `git --no-pager diff f7ddb693..de57a744 -- skills/check-issue/SKILL.md`.
- Criterion 2 (gate): `akrogon run-check --name criterion-2-rerun -- bun test tests/receipt-gates.test.ts` on `de57a744` → `check criterion-2-rerun: 0` — `implementation/check-criterion-2-rerun-1793539030758-3050610.log` (5 pass; planning-era red/green recorded in plan.md).
- Checks on `de57a744`: `check format: 0` — `implementation/check-format-1793539034581-3051436.log`; `check typecheck: 0` — `implementation/check-typecheck-1793539038363-3051573.log`; `check test: 0` — `implementation/check-test-1793539109256-3051764.log` (1262 pass, 68s wall).
- `akrogon verify`: green on the same tree `e87d167d` — first on `331682d9` (`verify leaf 331682d92728766d298b78b3df891e6ad06316d8: green`, ~1.5 min wall), then after the trailer-only amend the rerun on `de57a744` printed `reuse receipt 6d6a2d12-bc91-4e56-b12c-32faea54ff00 tree=e87d167dbbca01e87ea3ce0a2d47fe4ebec9f74b` and exited 0.

## Notes

- No refresh needed: branch already sat on the `origin/main` tip `f7ddb693`; a post-commit fetch+rebase was a no-op.
- Design's open question answered in plan D3: `docs/` needs no change — `docs/reference/checks.md` and `docs/reference/state-and-phases.md` already scope the leaf receipt to `check.repair → merge` only.
- Known limitations: none. Criterion 1's proof is the review walk, per the design's no-prose-test rule.

# brief-5: tsconfig include + format glob + full checks (plan U5, decision D7)

## 1. Goal

Make the repo's configured `checks` cover the new script: add `skills/chart-issues/scripts/**/*.ts` to `tsconfig.json` `include` and `skills/chart-issues/scripts` to the `format` script glob in `package.json` (done-criterion 5).

## 2. Acceptance criteria

1. `tsconfig.json` `include` becomes `["src/**/*.ts", "tests/**/*.ts", "skills/chart-issues/scripts/**/*.ts"]` (order preserved; watch-issues stays out — it has its own tsconfig).
2. `package.json` `format` becomes `prettier --write src tests skills/chart-issues/scripts`.
3. `bun run typecheck` passes (proves the new file typechecks under the root tsconfig).
4. `bun run format` exits 0; if prettier rewrites `peer-wait.ts`, the formatted result is committed (worker runs it and verifies a clean second run).
5. `bun test --changed=$AKROGON_BASE --timeout=30000` passes.
6. No other file changes.

## 3. Read-first list

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `tsconfig.json`, `package.json` (root) — the two files to edit
- `skills/watch-issues/tsconfig.json` + `tests/watch-issues-scripts.test.ts` — why watch-issues is NOT added (own project; do not widen)

## 4. Change list and needed interfaces

Owns exactly: `tsconfig.json`, `package.json`, and any prettier reformat of `skills/chart-issues/scripts/peer-wait.ts` resulting from step 4's own run. Nothing else may change.

## 5. Do-not, reasons and exceptions

- Do not add `skills/watch-issues/**` or create a `skills/chart-issues` package.json/tsconfig — watch-issues has its own because it ships tests+fixtures; chart-issues ships one script covered by the root project per the plan.
- Do not edit `peer-wait.ts` beyond whatever `bun run format` itself produces; a defect returns as a mismatch.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from A.

Restated: root config only, no new project files, no manual script edits; mismatch evidence over scope change unless A revises the brief.

## 6. Ordered steps

1. Edit `tsconfig.json` and `package.json` (criteria 1, 2).
2. `bun run typecheck` (criterion 3).
3. `bun run format`; inspect `git diff` on `peer-wait.ts`; if reformatted, run `bun run format` again to confirm idempotent (criterion 4).
4. `export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377; bun test --changed=$AKROGON_BASE --timeout=30000` (criterion 5).
5. `git add -A && git commit -m "typecheck and format peer-wait script"`; return the commit ID.

Advisory size: 2 files (+possibly 1 reformatted), under 8 turns.

## 7. Commands

```bash
export AKROGON_BASE=69038ef023a8434104bb9c6335f79daa1a6c2377
bun test --changed=$AKROGON_BASE --timeout=30000
```

## 8. Done-when, evidence and report

Done when all criteria hold and the commit exists. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

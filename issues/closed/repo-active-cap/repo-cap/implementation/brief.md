# Implementation brief: repo-cap

## 1. Goal

Optional per-repo `max_active` under the machine-wide ceiling, per plan.md decisions D1–D6. A registered repo with `max_active: N` in `issues/config.yaml` never has more than N non-merged leaves with live tabs; a repo without the key has no repo limit.

## 2. Acceptance criteria

1. `repoSchema` accepts `max_active` as an optional positive integer and rejects zero, negatives and non-integers.
2. Global 3, repo A `max_active: 1`, three eligible leaves in A: `next --all` opens one tab in A; uncapped repo B registered second gets the remaining seats.
3. Global 1, repo `max_active: 2`: one tab opens.
4. A leaf whose tab already exists is never refused by the repo cap.
5. Unreadable inventory charges its repo's cap as readable leaves plus unreadable count, and does not mark the repo full.
6. `akrogon config` prints `repo_max_active` when the repo sets `max_active`, omits it otherwise, and still prints the global `max_active`.
7. install.html, limits.html, next.html, in-practice.html, cheat.html and setup.html describe machine ceiling plus optional repo share; setup.html shows the key in the repo config example.
8. `bun run format`, `bun run typecheck`, `bun test` pass.

## 3. Read-first list

- Authoritative leaf: issues/open/repo-active-cap/repo-cap/{brief,design,plan}.md in the registered repo.
- src/config.ts repoSchema (lines 27–46) and effectiveConfig (lines 108–123).
- src/next.ts activeCount (262–271), allocate (273–300), sweepAll (524–533).
- tests/helpers.ts fixture/leaf/yaml/cli; tests/next.test.ts dispatchFixture (11–37), two-repo pattern (460–480), capacity cases (830–860); tests/config.test.ts.
- The six guide pages.
- This skill folder's ponytail.md.

## 4. Change list and needed interfaces

- src/config.ts: `max_active: z.number().int().positive().optional()` on repoSchema; effectiveConfig emits `repo_max_active` only when the repo sets it.
- src/next.ts: `activeCount` returns `{ total: number; perRepo: Map<string, number> }`; allocate refuses a new tab when total reaches the global cap or the leaf's repo count reaches its cap.
- tests/config.test.ts, tests/next.test.ts: criteria 1–6.
- Six guide pages: criterion 7.

## 5. Do-not

- No default for the repo key; no init or init-issues change (design exclusion).
- No warning when repo caps exceed the global cap (operator lock 1a).
- No sweep order, park, status or plugin changes (design exclusion).
- No fix for the stale `max_active: 0` pause advice in in-practice.html/cheat.html; it is plan limitation R1, report only.
- No files under `issues/` on the implementation branch; artifacts live in the authoritative checkout.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B.

## 6. Ordered steps

1. brief-1: code and tests (criteria 1–6), red then green.
2. brief-2: guide pages (criterion 7).
3. B runs the full suite and remaining checks, then reports.

## 7. Commands

Changed tests as work lands: `bun test --changed="c090787a05e86d1a32418e21b5b10161fd501efc"`. B runs `bun test`, `bun run format`, `bun run typecheck` after the last unit.

## 8. Done-when, evidence and report

All criteria verified with pasted command results; focused test output captured at evidence/cli-verification.log under the authoritative leaf; final check exit codes in the report.

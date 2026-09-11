# Sub-brief 1: repo-cap code and tests

## 1. Goal

Implement the per-repo `max_active` cap in config and dispatch, with tests. Plan decisions D1–D5. Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/repo-cap.

## 2. Acceptance criteria

1. `repoSchema` accepts `max_active` as an optional positive integer; zero, negatives and non-integers fail parse.
2. Global `max_active: 3`, repo A `max_active: 1`, three eligible leaves in A, uncapped repo B registered second with two eligible leaves: `akrogon next --all` opens exactly one tab for an A slug and two for B slugs.
3. Global `max_active: 1`, repo `max_active: 2`, two eligible leaves: `next --all` opens one tab.
4. Repo `max_active: 1`: a leaf with a live tab still re-prompts while a second tab-less leaf in the same repo is refused.
5. Global `max_active: 5`, repo `max_active: 3`, one malformed state.yaml plus two eligible leaves: `next --all` opens zero tabs, exits 1 and reports the malformed path (charge is leaves.length + unreadable = 3, meeting the cap). Then set repo `max_active: 4` and rerun: two tabs open, proving the charge is leaves plus unreadable, not mark-full. Global headroom is required because the same charge feeds the machine total.
6. `akrogon config` prints `repo_max_active` when the repo sets `max_active`, omits the key otherwise, and still prints global `max_active`.

## 3. Read-first list

- /home/ivan/Work/infra/akrogon/issues/open/repo-active-cap/repo-cap/plan.md (decisions D1–D5).
- src/config.ts: repoSchema (lines 27–46), effectiveConfig (108–123).
- src/next.ts: activeCount (262–271), allocate (273–300).
- tests/helpers.ts: fixture, leaf, yaml, cli.
- tests/next.test.ts: dispatchFixture (11–37), two-repo pattern (460–480), capacity reservation cases (830–860), resetPrompts/configure helpers (~line 800).
- tests/config.test.ts: the effective-config test including `fix_rounds: 0` rejection.
- ponytail.md in this skill folder.

## 4. Change list and needed interfaces

- src/config.ts: add `max_active: z.number().int().positive().optional()` to repoSchema. In effectiveConfig, emit the repo's value under the key `repo_max_active` only when set; the flat spread would otherwise let the repo value overwrite the global `max_active` line.
- src/next.ts: `activeCount(global, invocation)` returns `{ total: number; perRepo: Map<string, number> }`. Each repo's contribution is computed once and added to both: `global.max_active` when registration or inventory is unknown, `leaves.length + unreadable` when unreadable > 0, else the existing live-tab filter count. In allocate, keep the `matches.length === 0` precondition, then refuse when `counts.total >= global.max_active` or (`repo.config.max_active` is defined and `counts.perRepo.get(repo.name) ?? 0 >= repo.config.max_active`). activeCount has exactly one caller.
- tests/config.test.ts: new cases for criterion 1 (reject 0, -1, 1.5 via `akrogon config` exit code, same pattern as `fix_rounds: 0`) and criterion 6 (set and unset).
- tests/next.test.ts: new tests for criteria 2–5 using dispatchFixture, `leaf(g, slug, phase, { repo: 'other' })` for the second repo, `configure`/`yaml` for global config, and `resetPrompts` for criterion 4.

## 5. Do-not

- No default for the repo key; no init or init-issues changes (design exclusion).
- No warning when repo caps exceed the global cap (operator lock 1a).
- No changes to sweep order, park, status, plugin hooks, or the live-tab filter itself.
- No files under `issues/` on this branch; do not commit yet — B commits after the full suite.
- Return a mismatch with evidence instead of changing scope or an interface; the exception is a revised brief from B.

Restated: scope and interfaces are fixed by the plan; conflicts come back to B as a mismatch, not a local redesign.

## 6. Ordered steps

1. Write the failing tests first (criteria 1–6), run the changed-test command, record red output.
2. src/config.ts schema and effectiveConfig.
3. src/next.ts activeCount and allocate.
4. Run the changed-test command to green.

Advisory size: about 4 files and under 40 turns; work clearly beyond returns a mismatch with evidence.

## 7. Commands

`bun test --changed="c090787a05e86d1a32418e21b5b10161fd501efc"` — run from the worktree with `AKROGON_BASE=c090787a05e86d1a32418e21b5b10161fd501efc` in the environment.

## 8. Done-when, evidence and report

Criteria 1–6 green with pasted red-then-green output. Scenarios use temporary repositories, real files/processes and fake-herdr at one boundary; no real panes, install roots, GitHub or herdr socket.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

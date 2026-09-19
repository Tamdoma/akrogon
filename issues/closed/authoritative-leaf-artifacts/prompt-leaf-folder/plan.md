# Plan: prompt-leaf-folder

Debate is off (`debate: "no"`); synthesized directly from brief and design.

## Decisions

- D1: In `src/next.ts` `dispatchSlot`, the prompt becomes `` `${routing[state.phase].skill} ${state.slug} slot=${slot} phase=${state.phase} leaf=${leaf.path}` ``. `leaf.path` is already the absolute authoritative folder resolved by `discover()` (`src/state.ts:40`, `src/next.ts:100`). No new resolution, quoting, or escaping: the prompt is one argv element to `herdr agent prompt`, so a path containing a space survives verbatim.
- D2: Update the existing exact-text prompt assertions in `tests/next.test.ts` (lines ~120, 172, 678, 721, 775, 1315, 1407, 1721, 1746) to append ` leaf=${path}` using the `path` returned by `leaf(f, ...)`. `toContain` assertions are untouched.
- D3: Extend the assertion at `tests/next.test.ts:120` (planning phase) and the one at ~678 (merge, non-planning) to assert the prompt ends with ` leaf=${f.root}/issues/open/<container>/<slug>`; add to the same tests that the `leaf=` value does not contain `issues/worktrees` (criterion 2, worktree allocated in the same run).
- D4: New test for criterion 6: build a dispatch fixture, rename the repo root to a path containing a space (e.g. `mv f.root "${f.home}/repo root"`), rewrite `repos.repo` in `f.home/config.yaml` to the new path, create the leaf under it, run `next`, and assert the recorded prompt is one argument ending with the complete spaced `leaf=` value. The fake harness records `args[3]` verbatim (`tests/fake-herdr.ts:125`), so a split value would fail the assertion.
- D5: In each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md`: state the prompt shape as `<skill> <slug> slot=<S> phase=<P> leaf=<folder>` on the existing prompt line; add one sentence that pass artifacts are written under the `leaf=` folder, code is read and edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`. In implement-issue, place the standalone no-config, local-artifact note next to that fallback sentence.
- D6: Qualify every bare-filename write instruction in the four skills with the leaf folder: `positions-<slot>.md`, `rebuttal-<slot>.md`, `plan.md` (plan-issue); `review-<slot>.md` (check-issue, two places); `report.md` append (implement-issue check.fix). `implementation/report.md` in implement-issue is already `<leaf>`-qualified; `implementation/brief.md` under Standalone is a local artifact and stays unqualified. Read instructions and `learnings/` writes are untouched.
- D7: Update the printed-footer template `Next: <skill> <slug> slot=<A|B> phase=<phase>` in all four skills to include ` leaf=<folder>`, keeping the stated prompt shape consistent inside each file.
- D8: Update `docs/guide/next.html:68` ("The prompt is always four words") to name five fields including `leaf`. `README.md` and `tests/command-reference.test.ts` contain no prompt-shape mention; the report states that instead of editing them.

## Read first

- `src/next.ts` lines 355-445 (`dispatchSlot`, prompt at 411) and lines 86-127 (`discover`, `leaf.path` origin).
- `src/state.ts:40` (`Leaf = { path, state }`), `src/routing.ts` (phase → skill).
- `tests/next.test.ts` lines 1-60 (dispatchFixture, `database`, `next` helpers) and each assertion site listed in D2.
- `tests/helpers.ts` (`fixture`, `leaf`, `cli`), `tests/fake-herdr.ts` lines 104-127 (`agent start`/`agent prompt` recording).
- `skills/*/SKILL.md` prompt lines and write lines (grep hits in D6).
- `docs/guide/next.html` line 68.

## Interfaces

- Prompt string: `<skill> <slug> slot=<A|B> phase=<phase> leaf=<absolute authoritative leaf folder>`; `leaf=` is the last field and its value runs to end of line.
- `Leaf.path` (`src/state.ts`): absolute path under `<repo.root>/issues/open/`; unchanged.
- Fake harness contract (`tests/fake-herdr.ts`): `agent prompt <pane> <text> --wait --until working --timeout 5000`; `text` is `args[3]`, one element.

## Checklist

1. `src/next.ts`: append ` leaf=${leaf.path}` to the prompt at line 411. Criteria 1, 2, 6.
2. `tests/next.test.ts`: update the nine exact-text assertions (D2); add the `leaf=` suffix and not-worktree assertions (D3); add the spaced-root test (D4). Criteria 1, 2, 6.
3. `skills/plan-issue/SKILL.md`: prompt line, artifact/fallback sentence, qualify `positions-<slot>.md`, `rebuttal-<slot>.md`, `plan.md` writes, footer template. Criteria 3, 4.
4. `skills/implement-issue/SKILL.md`: prompt line, artifact/fallback sentence with standalone note beside it, qualify the check.fix `report.md` append, footer template. Criteria 3, 4.
5. `skills/check-issue/SKILL.md`: prompt line, artifact/fallback sentence, qualify both `review-<slot>.md` write lines, footer template. Criteria 3, 4.
6. `skills/merge-issue/SKILL.md`: prompt line, artifact/fallback sentence, footer template (its `review-A.md` mentions are existing-file reads/appends already scoped to the leaf; qualify any bare write). Criteria 3, 4.
7. `docs/guide/next.html`: update the four-words sentence to include `leaf`. Criterion 5.
8. Run `bun run format`, `bun run typecheck`, `bun test`. Criterion 7.

## Verification

- `bun test tests/next.test.ts` green, including the new spaced-root test and the updated exact-text assertions.
- `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` shows no unqualified write instruction (read instructions may remain).
- `bun run format` and `bun run typecheck` clean.
- Report states README.md and command-reference.test.ts had no prompt-shape mention (verified by grep during planning).

## Known limitations

- The `leaf=` value is space-terminated only by end of line; a leaf path containing a newline is unsupported, same as today for any path. Acceptable: repo roots with newlines are not a real configuration.

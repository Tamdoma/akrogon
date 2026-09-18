# Brief: prompt-leaf-folder

## What
`akrogon next` dispatches `<skill> <slug> slot=<S> phase=<P> leaf=<absolute authoritative leaf folder>` where the folder is the leaf's `leaf.path` under the registered root's `issues/open/`. Each lifecycle skill (`plan-issue`, `implement-issue`, `check-issue`, `merge-issue`) states the new prompt shape on its prompt line and says that every pass artifact (positions, rebuttal, plan, implementation briefs and report, reviews) is written under the `leaf=` folder while code is read and edited only in the worktree. Lessons keep their existing home in the registered checkout's `learnings/` and are not relocated. A manual invocation that names a slug without `leaf=` keeps today's `akrogon config` lookup; standalone implementation without a slug is unchanged and reads no config.

## Why
The prompt carries no path (src/next.ts:411) and the seat pane starts in the worktree (src/next.ts:298-299), so seats wrote `positions-<slot>.md` relative to cwd into the worktree copy and committed it on the branch (Tamdoma/akrogon#18). The plan skill named the read location (skills/plan-issue/SKILL.md:14) and the seats still guessed on write. The command already resolved the folder; giving it removes the guess.

## Done-criteria
1. `src/next.ts` prompt at the dispatch site includes ` leaf=<leaf.path>` after `phase=<P>`, where `leaf.path` is the absolute authoritative folder. Test in `tests/next.test.ts` asserts a dispatched prompt ends with `leaf=<f.root>/issues/open/<...>` for one planning and one non-planning phase; existing exact-text prompt assertions are updated.
2. Test: the `leaf=` value is never under the worktree path (`issues/worktrees/`), asserted for a leaf whose worktree was allocated in the same run.
3. Each of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md`, `skills/merge-issue/SKILL.md` states the prompt shape with `leaf=<folder>` and has one sentence that pass artifacts are written under that folder, code is edited only in the worktree, and a manual prompt naming a slug without `leaf=` falls back to locating the slug under the registered repo's `issues/open/`. `skills/implement-issue/SKILL.md` standalone mode (no slug) keeps its no-config, local-artifact behavior and says so next to the fallback sentence. Verify by reading; no exact wording is required.
4. Write lines that name a bare filename (`positions-<slot>.md`, `rebuttal-<slot>.md`, `plan.md`, `implementation/report.md`, `review-<slot>.md`) are qualified with the leaf folder or a reference to it. `grep -n "positions-\|rebuttal-\|plan.md\|report.md\|review-" skills/*/SKILL.md` shows no unqualified write instruction; hits that are read instructions are fine.
5. `README.md`, `docs/guide/` and `tests/command-reference.test.ts` mentions of the dispatched prompt shape are updated or, if none, that is stated in the report.
6. Test: a fixture whose registered root path contains a space dispatches one prompt argument whose `leaf=` value is the complete authoritative folder, asserted against the fake harness's recorded prompt.
7. `bun run format`, `bun run typecheck`, `bun test` pass.

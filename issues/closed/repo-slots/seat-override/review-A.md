# Review A: seat-override

Base: `329e59d951969f49008a2d7c2fab99c867d133c5`
Reviewed head: `57bd933cb69d8e825bc84502dc125b1c927a330b`

## Findings

None.

## Verification evidence

- `bun test tests/config.test.ts tests/init.test.ts tests/next.test.ts tests/docs-links.test.ts` — 135 pass, 0 fail (rerun by reviewer).
- `bun run typecheck` — clean (rerun).
- `bun run format` — all files unchanged (rerun).
- `git status --porcelain issues/` — empty.
- `src/AREA.md` path check — all named file paths exist; command lines are commands, not paths.
- Docs pages for changed behavior (`docs/guide/setup.md`, `docs/guide/cheat.md`, `README.md`, `skills/init-issues/SKILL.md`) — claims match implementation: whole-seat `{harness, model, effort}` override, applies at next agent start, harness must exist in global registry.

## Judgment vs plan

- D1: `repoSchema.slots` is a strict optional `{a?, b?}` of full `slotConfigSchema` triples — no field-level merge. Matches.
- D2: selection only; `seats` throws `Missing harness template "<h>" for seat <s> in repo <name>` when the harness is absent from `global.harnesses`. Matches.
- D3: single resolver in `src/config.ts`, `repo.config.slots?.<seat> ?? global.slots.<seat>`. Matches.
- D4: `launch(global, repo, slot)` resolves via `seats`; template fill, `quote()`, first-token check unchanged. Only call site updated (`src/next.ts:432`).
- D5: `effectiveConfig` prints `seats(global, repo)` inside a repo, `global.slots` outside; verified by tests from root, linked worktree and outside.
- D6: `initialize` calls `seats` after `readGlobal` and before `checkGrounding`/writes; `dispatchLeaf` calls `seats` before `allocate` inside the try caught by `report()` — verified no worktree/tab/pane on refusal by test.
- D7: no new phase/command/file; repos without `slots` unchanged; no `issues/` files touched.
- Tests exercise the real CLI and fake Herdr argv; no mocks of the unit under test; negative tests present per criterion 7.
- `debate: no` — no positions/rebuttal artifacts expected.

## Verdict

ready

## Merge evidence

- Rebase target: `origin/main` = `329e59d951969f49008a2d7c2fab99c867d133c5` (unchanged base; rebase no-op, head stays `57bd933cb69d8e825bc84502dc125b1c927a330b`).
- `AKROGON_BASE` after rebase: `329e59d951969f49008a2d7c2fab99c867d133c5`.
- `bun run format` — all files unchanged.
- `bun run typecheck` — clean.
- `bun test --changed="$AKROGON_BASE"` — 236 pass, 0 fail, 8 files.
- `bun test` — 287 pass, 0 fail, 13 files.

# Review A: pull-all-repos (check.review, initial)

- Base: `a2f3e7a378d025930e12ac05ce8710f57f0752a2`
- Reviewed head: `fe3e1c1` (`pull-all-repos: pull every registered repo from any directory`)
- Debate: no. No positions/rebuttals read, none expected.

## Verification evidence

- Diff scope matches plan checklist 1-3 exactly: `src/pull.ts`, `tests/pull.test.ts`, `README.md`. Nothing else on the branch.
- `pullCommand` in `src/pull.ts` now branches `if (!all) { pullRepo(requireRepo(...)); return; }` then the unchanged `global.repos` loop with per-repo try/catch, `console.error(JSON.stringify({repo, error}))`, and `AggregateError` naming failed repos. D1-D3 held. `pullRepo`, `closeSource`, `closeSources` untouched.
- `currentRepo` dropped from the pull.ts import; still exported and used by `config.ts:121,140` per the design exclusion.
- Tests use the real CLI on real temp git repos with the existing `fakeGh` boundary; no mocked repo resolver (D4). Positive test covers three cwds (registered root, `git worktree add` linked worktree, unregistered dir), two registered repos, asserts one stdout line per repo and both seed trees, and asserts no seeds written into the linked worktree. Negative test registers a GitLab-origin repo, runs `--all` from inside the healthy repo, asserts non-zero exit, stderr naming `bad` and `gitlab.com`, and the healthy seed written (A1-A3).
- Plain-pull tests untouched; report records full `bun test` 326 pass / 0 fail, `tsc --noEmit` clean, `prettier --write` clean, and `bun test --changed` 8 pass / 0 fail with a documented red-before-green (A2). No code change since, so no rerun.
- A5 evidence exists: `/tmp/pull-all-repos-2026-09-28.log` shows one line per all 7 registered repos, run from `plugin/` cwd, matching the defect scenario.
- AREA.md check: `src/AREA.md` and `tests/AREA.md` name no files removed or renamed by this diff; neither documents the `--all` narrowing, so no documented behavior changed in them.
- README row keeps `akrogon pull [--all]` so `command-reference.test.ts` still parses; updated text states `--all` pulls every registered repository from any directory (A4). `docs/guide/*` mentions only plain pull, unchanged per plan.
- Live contract check: `src/akrogon.ts:61-63` still dispatches `pullCommand(values.all === true)`; CLI surface unchanged.
- No `.env` keys required by brief/design; presence check not applicable.

## Findings

- N1 (nit): Plan D5 scoped the README edit to the pull row effect and the `:153` sentence only, but the diff also rewrote the preceding sweep sentence ("A sweep" -> "A next sweep", single sentence). The rewrite is accurate and clarifies which command owns the current-repo behavior, so it is a wording-scope deviation, not a defect.

## Verdict

`nits` — all done-criteria verified against the diff, live code, report evidence, and retained run log; one harmless doc-scope deviation.

## Merge pass (slot A)

- Rebase: prior reviewed head `fe3e1c1` onto `origin/main` `e99801db99492a23131d2b2648500fb3bc0d8209` (base moved from `a2f3e7a`), clean, resolved head `d6f42f8`.
- Checks on rebased head, AKROGON_BASE=e99801db99492a23131d2b2648500fb3bc0d8209:
  - `bun test --changed`: 8 pass / 0 fail / 93 expects.
  - `bun test`: 326 pass / 0 fail / 3863 expects across 15 files.
  - `bun run typecheck` (`tsc --noEmit`): clean.
  - `bun run format` (`prettier --write`): all files unchanged.
- Push: `git push origin HEAD:main` -> `e99801d..d6f42f8`, fast-forward.
- Nit N1 not recorded in learnings: a README wording-scope deviation is not a reusable mechanism.

# Review A: leaf-env-file

Base: `309d742605a0516067840863ffdf3be29b03fc0c` · Reviewed head: `6573c84`

## Evidence

- Diff inspected in full: `git diff 309d742...HEAD` (8 files, +207/-76): `src/next.ts`, `src/state.ts`, `src/AREA.md`, `skills/implement-issue/SKILL.md`, `skills/plan-issue/SKILL.md`, `tests/next.test.ts`, `tests/batch-dispatch.test.ts`, `tests/state.test.ts`.
- Live probe: `bun -e` `parseEnv` on empty values, quoted `#`, trailing comments, embedded newlines — all round-trip correctly through `JSON.stringify` emission (double-quoted, `\n` escaped).
- Checks rerun by A at implement end (report): `bun run typecheck` clean; `bun test --changed` 572/0; `bun test --timeout=30000` 717/0; `bun run format` clean after unrelated drift reverted.
- AREA.md path check: `src/AREA.md` names `src/akrogon.ts`, `src/preflight.ts`, `src/config.ts`, `src/init.ts`, `src/phase.ts`, `src/shell.ts`, `src/readiness.ts`, `docs/reference-index.md`, `tests/helpers.ts` — all exist (verified `ls`). The rewritten `.env` line matches the implementation.
- No documented behavior elsewhere changed; README and `docs/` carry no `.env` statement (grep-verified during planning).

## Judgment

- D1–D8 implemented as planned. Ordering inside `writeLeafEnv` is correct: refusals run before the live short-circuit (criterion 4 on every dispatch), parse and missing-name refusal before any write (criterion 3), atomic temp-in-`.git` + `renameSync` over symlink/file (criterion 1).
- `env_generation` counts rewrites: bumped only when `leaf.state.worktree` was already recorded. First write 0, each no-live-tab redispatch +1 — matches test contract and the criterion-2 outcome ("next dispatch with no live tab … bumps the generation"); the old ambiguous "bump on every write" plan note was resolved to this in plan.md Implementation notes.
- No values anywhere: refusal messages carry names/paths only; the sentinel test greps stdout, stderr and state.yaml. `parseEnv` is the repo's existing parser (`readiness.ts:110`).
- Tests match the acceptance bar: smallest real-boundary dispatch tests, fail-before shown (wave-1 landed red, implementation turned them green), real-file/stale-link refusals deleted with the cited design change.

## Findings

- N1 (Nit): `env_generation` also bumps when a dispatch writes `.env` but dies before `saveState` reaches a tab (e.g. workspace lookup throws) — the file and counter may reflect a generation no seat consumed. Consequence today: a skipped "generation 1" in the record only; the criterion outcome (rewrite on no-live-tab dispatch) still holds. Deferred because it needs a dispatch death mid-`allocate` and nothing reads the counter yet. Promote if evidence shows a stale `.env` surviving into a live seat.
- N2 (Nit): if the operator changes `env:` while a tab is live, state `env_names` keeps the old list but the frozen `.env` silently holds stale names until the tab dies. Consequence today: frozen tab uses the old declared set, as designed ("reused while a tab is live"); the recorded names describe what was written. Deferred: locked design semantics. Promote if a seat is shown to need mid-life config refresh.

## Verdict

`ready`

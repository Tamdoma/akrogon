# Review A: batch-limit-repo

Base `2e78945`, reviewed head `6521517` (`ab7ef69..6521517`, 6 commits, 13 files). Debate was off; reviewed against plan.md decisions D1–D7, brief done-criteria 1–6, design scope, and live surfaces.

## Verified

- D1: `batch_limit` in `repoSchema` (`src/config.ts`), `z.number().int().positive().default(4)`; refusal names the key via zod path (same mechanism as `fix_rounds`/`max_active`); `bun src/akrogon.ts config` prints `batch_limit: 4`.
- D2: `mergeTurn` selection slices `min(repo.batch_limit - 1, holder.batch_limit ?? ∞)`; solo filter gone (`src/next.ts:1014`).
- D3: `State.solo` removed, `readState` drops the stored key; all three leaf writes removed (`next.ts` restoreDrifted + member-conflict, `phase.ts` restack + `commitMove`); dead `batch.solo` creation dispatch removed; batch-record `solo` paths untouched (verified `src/next.ts:1137-1145`, `phase.ts:576-665`, `batch.ts:124`).
- D4: `excluded` on `batchSchema`, appended in both mergeTurn and restack rewrites.
- Criteria tests present and meaningful: default-cap-3 (`['bb','cc','dd']`), limit/split matrix, refusal loop naming `batch_limit`, modify/delete exclusion + member-failed dissolve + re-carried proof. Deliberate-break evidence in worker report.
- Docs: setup bullet, merge.md cap + exclusion prose, state.md `excluded` field + leaf-flag paragraph fixed, merge-issue skill wording fixed.
- `Test-Change:` trailers on all 4 test-touching commits, sources cited.
- checks: `bun run format` clean (status.ts drift reverted per lesson), `tsc` clean, `bun test` 607/0, `test_changed` 486/0.
- Swept `skills/`, `docs/`, `src/` for stale leaf-`solo` references; `tests/next.test.ts` 'solo' hits are unrelated container names.
- No `AREA.md` in the diff; doc-checklist line in plan covered guide + skill files.

## Findings

### N1 (Nit) — `skills/init-akrogon/SKILL.md` repo-key proposal list missing `batch_limit`

Reproduction: `skills/init-akrogon/SKILL.md:27-36` lists every repo key the setup pass proposes (`remote`, `default_branch`, `worktree_root`, `rebuttal`, `fix_rounds`, `implement`, `setup`, `checks`, `merge_checks`, `merge_covers`, `advisory`, `grounding`, `broadcast`, `slots`) and instructs "Propose every repo key below" — `batch_limit` is absent, so a fresh `init` proposal skips the key. Consequence today: a repo initialized by the skill gets no `batch_limit` proposal; the effective default 4 still applies correctly, and `docs/guide/setup.md` documents the key, so behavior is correct and only a proposal choice is lost. Deferred because: the schema default produces the intended behavior without the key; the plan's doc checklist covered guide + merge skill but did not name init-akrogon, and adding one line to the proposal block is a trivial follow-up any later leaf or handoff can do. Promotes to Fix if an operator reports a repo that needed a non-4 limit and wasn't offered it, or when the skill next changes.

## Verdict

`nits` — all done-criteria proven, checks green, one doc-completeness nit.

# Implementation report: self-update

Base: 9e2dfbebcfd98e647d34bed995741410ce95c2e4 · Head: 64545bc (branch `self-update`)

Delegated, 3 waves, 5 workers. Worker reports: `worker-u1..u5-report.md` beside this file.

## Changed files

- `src/install.ts` (u1, 170b9b3) — link reconciliation split into `planSkillLinks(home, sourceRoot)` (prunes dangling owned links, computes links and conflicts, creates nothing) + `applySkillLinks(links)`; `install()` composes them with identical observable behavior.
- `src/phase.ts` (u2, b57a163) — `phaseCommand` returns `{ repo, committed, to?: Phase }`; `to` set by `onCommitted` (`= requested`), left undefined on hold/split commits.
- `docs/guide/install.md` (u3, 6c4fcf8) — `git pull` block replaced with the self-update contract (triggers, one line, operator remedies).
- `src/self-update.ts` (u4, 8f14874, new) — `selfUpdate(repo, ownRoot = toolRoot, home = homedir())`: realpath identity gate inside the catch-all, install lock over the sequence, fetch → shape gate → `git merge --ff-only` under the global lock → `bun install --frozen-lockfile` → link reconciliation; one printed line; never throws.
- `src/akrogon.ts`, `src/next.ts` (u5, d561476) — phase case passes `committed.to` to `mergeWake`; `mergeWake` runs `selfUpdate` first in its try when `committedTo === 'merged'`; `nextCommand` runs `selfUpdate` before the global lock for `--all`/`--resume` (all registered repos) and manual next (selected repo), per-repo try/catch warn-only.
- `tests/install.test.ts` (u4) — 10 `test.serial` self-update cases, real bare-remote+clone fixtures, real offline `bun install --frozen-lockfile`.
- `tests/next.test.ts` (u5, 04953b9 + 64545bc format) — 4 spawned-script `mock.module` wiring tests.

## Criterion → evidence

1. ff keeps unrelated edit, `deployed` line → `self-update > fast-forwards a behind checkout…` test.
2. overlapping edit blocks → `refuses a fast-forward overlapping a dirty edit…` (step+error+lag+remedy asserted).
3. other branch / detached / ahead / diverged → four `skips …` tests, `akrogon sync` named for ahead/diverged.
4. failed install retries → `reports a failed install and reports current once the lockfile is restored`.
5. consumer repo never runs → `is a silent no-op when repo.root is not ownRoot` (remote deleted so a fetch would visibly fail).
6. skill add/prune/conflict → `links a skill added… prunes…` + `names a conflicting directory in the line and still creates the other links`.
7. step failure keeps merge/next results → `a throwing self-update still lets phase merged commit and next dispatch` (phase exit 0 + `moved merged`, next dispatches).
8. next behind line → step line is the only output; `next --all/--resume/manual` test asserts self-update invoked before dispatch herdr calls; behind-line content proven by skip tests.
9. guide → install.md rewrite; `tests/docs-links.test.ts` green; no `git pull` remains.

Deliberate break (standing design): stubbing the ff call turned the criterion-1 test red (`deployed <same>..<same>`), restored to green — recorded in worker-u4-report.md.

## Commands run (on the lane, committed head 64545bc)

- `AKROGON_BASE=9e2dfbe… bun test --changed=9e2dfbe… --timeout=30000` after each cherry-pick → final 273 pass / 0 fail (3 files, ~26s).
- `bun run format` → pass; reformatted our own `tests/next.test.ts` (committed 64545bc); reverted pre-existing drift in `src/status.ts` and `skills/chart-issues/scripts/peer-wait.ts` (untouched by this leaf; note: the files drift again whenever `format` runs — pre-existing at base).
- `bun run typecheck` → clean.
- `bun test --timeout=30000` (full suite) → 687 pass / 0 fail, 34 files, 64.65s wall.
- `merge_checks`: none configured; brief names no whole-suite requirement beyond `checks.test`.

## Known limitations

- `phaseCommand.to` records `requested`, not the resolved commit: `check.review` can redirect by verdict and `check.fix` caps to `failed`. No false `merged` is possible — `merged` requests never redirect — so the only consumer is unaffected. (worker-u2 report)
- Fetch-failure line verified by construction, not a dedicated test. (worker-u4 report)
- Design limit carried: an already-running seat keeps its loaded code and skill text; deployment reaches the next invocation.
- Bun `concurrentTestGlob` flattens `describe.serial`; in-process console/env capture in this file must stay `test.serial`. (worker-u4 report)

## Unverified criteria

None.

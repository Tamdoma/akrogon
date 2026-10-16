# Implementation report: release-deploy

## Changed files and reasons

- `src/release.ts` (new) — release filesystem mechanics: `releases/` + `current` + `deploy.yaml` + `release-hold.yaml` under `globalHome()`; `ensureCurrent`, `buildRelease` (git archive → tar → `bun install --frozen-lockfile` in a `.build-<sha>` sibling, rename only when complete), `flip` (atomic temp-link rename), `currentReleaseCommit`, deploy record read/write, hold read/clear, `pruneReleases` (keep current+previous, stamp `replaced`, delete after 24h).
- `src/install.ts` — `planSkillLinks(home, sourceRoot, ownedRoots, listRoot?)` is pure: returns `{links, conflicts, stale}`; all link sources are `current/*`; owned links (under `current`, `releases/`, `toolRoot`, or the registered `akrogon` workspace) are repointed instead of conflicted; `stale` lists links into `releases/` or dangling links into owned skills roots for the caller to unlink; `install()` ensures `current`, prunes stale, refuses on conflicts, then applies links and links `current/plugin` to herdr.
- `src/self-update.ts` — `installStage` replaced by `deployStage` (steps: fetch/resolve/hold/build/links/flip/reload/record); own-repo = `repo.name === 'akrogon'`; `ownRoot` parameter removed; deploy runs after the records stage whatever its outcome; failure writes `deploy.yaml` and the pass prints `deploy failed: <step>: <error>; retried at the next trigger`. `links` runs before `flip` and validates conflicts before any mutation so a rejected deploy activates nothing and changes no link; `previous === sha` counts as done only when the record is `ok` with `commit === sha`, otherwise the pass resumes links/flip/reload/record; same-commit recovery keeps the stored `previous` and its replacement stamp (repair F6).
- `src/status.ts` — overview prints `deploy failed: attempted <sha12>, active <sha12|none>, step <step>: <error>` while the record shows `ok: false`. 
- `src/AREA.md` — `src/release.ts` and deploy-stage key-file lines.
- `.gitignore` — `releases/`, `/current`, `/deploy.yaml`, `/release-hold.yaml` so a workspace deploy before the state-home migration completes leaves no tracked-file noise.
- `skills/seed-issue/SKILL.md` — akrogon root = `dirname(dirname(readlink -f $(command -v akrogon)))`; akrogon workspace = `repos.akrogon` in the state-home config, `git rev-parse` fallback only for dev checkouts.
- `skills/chart-issues/SKILL.md` — presence-check cwd stated as the resolved release/workspace root.
- `skills/merge-issue/SKILL.md` — unchanged: `dirname(readlink -f $(command -v akrogon))/lessons.ts` already resolves through `current` to `<release>/src/lessons.ts`.
- `README.md`, `docs/guide/install.md`, `docs/guide/create.md`, `docs/guide/learn.md` — release model prose; `checkout pending` remedies retained for the records move.
- `tests/release-deploy.test.ts` (new) — the eight criterion tests, all red on base.
- `tests/install.test.ts`, `tests/self-update.test.ts` — expectation corrections cited in commits (links through `current`, `ownRoot` removed, herdr fake added, repoint replaces wrong-owned refusal, dirty-lockfile test rewritten).

## Deviations found during implementation

- bun does not write `bun.lock` for a dependency-less `package.json`; the deploy fixture carries `vendor/tiny` as a `file:` dep so `--frozen-lockfile` has a lockfile (worker finding, fixed in test fixture).
- `herdr plugin link` uses `spawnCaptured(..., {env: process.env})` — `command`/`run` pass `env: undefined`, which bun resolves as process-startup env, losing in-process PATH (the shim-PATH lesson); the fake would not have been reached without it.
- A pre-existing `releases/<sha>` is reused as complete; crash-mid-build leftovers are `.build-*` and never reachable.
- Prune stamps a release at the moment `writeDeploySuccess` replaces it (repair F3), and an unchanged-main pass still runs `pruneReleases`, so expired releases are removed without waiting for a new commit.

## Commands run

- `bun test tests/release-deploy.test.ts` on base: 8 fail (red evidence, plan.md C1-C8 logs).
- `check deploy-tests: 0 .../check-deploy-tests-1792120209269-1146599.log` — 49 pass: the three touched files.
- `check format: 0 .../check-format-1792120218280-1160373.log`
- `check typecheck: 0 .../check-typecheck-1792120227981-1164592.log`
- `check test: 0 .../check-test-1792120368653-1168226.log` — 965 pass, 0 fail, 134s.
- Repair round 1: B's `a937dfc`/`fe31a0c` (records fetch/push errors persist deploy failure) and `b476888`/`4812c0d` (replacement stamps at the flip, idle-pass pruning); A's test corrections `2edd5b8`/`cfadc48` and worker u6 `883e609`→`27d471b` (links before flip, interrupted-deploy resume, failure-record `commit` carry, status `!ok` visibility, `listRoot` enumeration).
- Repair round 2: B's `179e832`/`5d46382` (same-commit recovery keeps previous and its stamp); A's test corrections `140929f` and worker u7 `6e494cc`→`cc09b62` (pure `planSkillLinks`, conflicts reject before any link mutation; `install()` keeps its prune-then-refuse contract).
- `check repair-A-F1-red: 1 .../check-repair-A-F1-red-1792121911226-3173931.log` — corrected conflict + new interrupted-deploy tests fail on the pre-repair product for the right reasons.
- `check repair-A-deploy-tests: 0 .../check-repair-A-deploy-tests-1792123099014-3696878.log` — 52 pass on the repaired head.
- `check repair2-A-F5-red: 1 .../check-repair2-A-F5-red-1792124369775-1770155.log` — the three zero-mutation regressions fail on the pre-repair product.
- `check repair2-A-deploy-tests: 0 .../check-repair2-A-deploy-tests-1792124812340-1975693.log` — 55 pass on `cc09b62`.
- Deliberate-break proofs on the final head: `check break-C3-red: 1` / `break-C3-green: 0` (link sources bypass `current`); `check break-C4-red: 1` / `break-C4-green: 0` (failure record not written); `check break-C5-red: 1` / `break-C5-green: 0` (24h retention changed to 365d). Each break was reverted before its green run.
- Final: `verify leaf cc09b62f6acbb95e64a46ea62e6b91b851951b88: green` — `check test: 0 .../check-test-*.log` (969 pass), `check format: 0`, `check typecheck: 0`.
- Workers: u1 `1049135` (release.ts), u4 `b2bc980` (skills/docs), u2 `ccf5322` (install.ts), u3 `d83f111` (status.ts), u5 `68c5b57` (self-update.ts+AREA.md), u6 `883e609` (deploy resume), u7 `6e494cc` (conflict-before-mutation); lane commits `63a2cd8`, `b515504`, `7b96cf9`, `b1169c5`, `2edd5b8`, `cfadc48`, `140929f`.
- Base: `83b92799495c40595a09ca13e08c588f89ae66ca`; head: `cc09b62`. Refresh: branch already on current origin/main.

## Criterion proof

- C1 build+flip+printed sha: `deploy builds a complete release, flips current and prints the deployed commit` — pass.
- C2 dirty workspace edit pending, deploy lands: `an uncommitted workspace edit stays pending in records while the deploy still lands` — pass.
- C3 links through `current`, add/remove no dangling: `every link resolves through current and a skill add or remove leaves no dangling link` — pass.
- C4 failed build keeps `current`, status reports, retry: `a failed release build keeps current, reports in status and retries` — pass.
- C5 prune >24h except current+previous: `releases other than current and previous are deleted 24 hours after replacement` — pass.
- C6 first switch without hand step: `the first deploy switches workspace-pointing links to the release without a hand step` — pass.
- C7 skill steps resolve through release, no `.git`: `skill steps resolve the akrogon root through the release, never through git` — pass.
- C8 hold blocks the named commit: `a hold record blocks the named commit while it is main` — pass.

## Known limitations

- On a `fetch` failure before the tracking ref resolves, `deploy.yaml` records `attempted: ''`; the status line prints `attempted ,` in that case. Cosmetic.
- Accepted design cost kept: a process running from a replaced release over 24h can break.

## Unverified criteria

None.

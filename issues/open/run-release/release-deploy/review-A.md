# Review A: release-deploy

Base: 83b92799495c40595a09ca13e08c588f89ae66ca — Reviewed head: b1169c5c5db5c70722d4062abcfe7b24ce20a52c

Evidence: `check test: 0` (965 pass), `check format: 0`, `check typecheck: 0`, `verify leaf b1169c5: green`; all eight criterion tests pass at head.

## Findings

### F1 (Fix) — A deploy that fails after the flip is never retried and never reported

`src/self-update.ts` `deployStage`: `previous` is captured from `currentReleaseCommit()` and `if (previous === sha) return null` short-circuits before the `links`, `reload` and `record` steps. When a deploy reaches `flip` and then fails in `links` (conflicting destination — the existing suite simulates exactly this with a real directory at `~/.claude/skills/skill-one`), `current` already points at the new release. The next pass resolves `previous === sha` and returns `null`: the failed link reconciliation is never retried, `deploy.yaml` stays `ok: false` forever, and dispatch continues printing nothing deploy-related. Simultaneously `src/status.ts` suppresses the failure line because it requires `deploy.attempted !== active` — after a post-flip failure `attempted === active`, so `akrogon status` is silent too.

Realistic source: the operator removes the conflicting path the `deploy failed: links` message named (the exact remedy the code prints), or a crash lands between `flip` and `writeDeploySuccess`. Consequence today: the conflicting skill link is never repaired until an unrelated commit lands on main, criterion 4's "retried at the next trigger ... until a later deploy succeeds" fails for every post-flip step, and criterion 3's link guarantee silently breaks. Reproduction: `tests/release-deploy.test.ts` `a failed release build keeps current, reports in status and retries` covers only the install step; extend the conflict case — after a `links` failure, remove the conflict and run `selfUpdate` again: links are never applied and `akrogon status` prints nothing.

Repair shape: when `previous === sha`, consult the record — return `null` only when `readDeployRecord()?.ok === true`; otherwise continue the pipeline (build reuse is idempotent, `flip` onto the same sha is a no-op replace). In `status.ts` drop the `attempted !== active` clause so a recorded failure prints until a success overwrites it.

### N1 (Nit) — `attempted` is empty for `resolve`-step failures

A `git fetch`/`rev-parse` failure records `attempted: ''` (sha never resolved); the status line prints `deploy failed: attempted , active ...`. The attempted commit genuinely does not exist; cosmetic, and criterion 4 still gets its step name. Deferred: fix is display wording only.

### N2 (Nit) — `deploy.yaml` `replaced` map grows forever

Pruned release names keep their `replaced` stamps across successful writes (`writeDeploySuccess` merges `existing.replaced`). A hundred deploys leaves a hundred dead keys. Consequence: cosmetic file growth; promotion evidence would be a real consumer misreading the map.

### N3 (Nit) — `.next-<sha>` leftovers survive until the next successful flip

`flip` removes its temp link before rename but a crash between `symlinkSync` and `renameSync` leaves `.next-*` in `releases/`; `pruneReleases` skips it forever. Consequence: one dead symlink at worst; the next `flip` removes it (`rmSync(next)` before symlink). Deferred.

## Checks on the diff

- `planSkillLinks` repoint semantics verified against `install.test.ts` repoint/prune tests and the stale-scan narrowing (`releases/` or dangling-under-owned-skills-roots) the worker made — matches the committed `sibling-prefix`/`resolving-owned` expectations.
- `install()` `ensureCurrent` + `current/plugin` herdr link verified.
- `src/AREA.md` named paths all exist (`src/release.ts`, `src/self-update.ts` present).
- Docs: README/install.md/create.md/learn.md updated; `merge-issue` lesson-helper line correctly left unchanged (resolves through `current`).
- `deployStage` runs under the existing `akrogon-install.lock`; records stage (`gitStage`/`moveCheckout`/lock) untouched.
- Debate was off (`debate: no`); no position files expected.
- `Test-Change:` trailers present on the two test-correction commits, each citing the design change as source.

## Verdict: fix

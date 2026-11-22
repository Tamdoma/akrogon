# Plan: agy-skill-link

## Decisions

- **D1** The only product change is adding `'.gemini/config/skills'` to the `roots` list in `planSkillLinks` (`src/install.ts:27`). One list feeds link planning, owned-link repointing, conflict refusal, and the stale scan, so both done-criteria follow for `install()` and for the deploy `links` step in `src/self-update.ts:256-272`, which calls the same planner with `listRoot` at the new release. agy's real skill root is `~/.gemini/config/skills`; the live listing on this host already holds `diagnose-crash`, `herdr`, `omarchy`, `omarchy-contribute`, `omarchy-make-app`, `omarchy-make-game`, `omarchy-make-plugin`, `omarchy-make-theme` — foreign entries install must keep, covered by the prune test's foreign-link and real-entry fixtures.
- **D2** `tests/install.test.ts` gains the root by extending its file-level `roots` constant (line 24) to five entries. Every parameterized case (`for (const root of roots)` covers prune/refuse per kind, repoint, and the sweep inside each roots-scoped test) then covers the agy root with no new test cases. Literal-path assertions are added: in `install creates all ... absent harness roots` that `resolve(f.home, '.gemini/config/skills', skills[0])` reads `resolve(f.home, 'current', 'skills', skills[0])` and resolves to `toolRoot`, and in `install from a listener release ...` that the same literal path points into the release's `skills/skill-one`. This is B's L11 reading: the test names the agy destination literally while enumerating skills from `skills/`.
- **D3** `tests/deploy-fixture.ts` `roots` (line 7) gains the same fifth entry, so deploy-path tests (`release-deploy.test.ts`, `rollback.test.ts`) assert the agy destination through the deploy `links` step, the second planner consumer. No deploy-fixture case asserts a root list's absence, so extending the constant widens assertions without breaking fixed fixtures.
- **D4** "links into old releases are pruned" gets one seed in the existing `install prunes only dangling owned links ...` test: inside the existing per-root loop, a `release-link` symlink at each root pointing into `resolve(f.home, 'releases', 'old-release', 'skills', 'ghost')` (nonexistent release dir → `within(target, releasesDir())` selects prune), asserted removed with the other stale names. Deploy-path release pruning is already proven by `release-deploy.test.ts` and the self-update suite iterating the extended D3 roots.
- **D5** `docs/start/install.md` line 72 lists `~/.gemini/config/skills` alongside the other roots. No other doc enumerates the roots (`skills/seed-issue/SKILL.md` mentions `~/.claude/skills/check-issue` as an example path only — not a root list).
- **D6** No live agy session: readiness.yaml proofs record P3 observing agy loading a skill linked into that folder (agy 1.5.3-era antigravity CLI, operator account, 2026-11-20). The criterion is mechanical.
- **D7** Serial-solo: implementation is one unit owning the whole diff, so implement-issue's one-unit rule has A implement it.

## Read-first

- `src/install.ts` — `planSkillLinks` roots list, `staleIn` scanner, `applySkillLinks`.
- `src/self-update.ts` lines 255-272 — deploy `links` step consuming `planSkillLinks` with `listRoot` at the new release.
- `src/release.ts` — `ensureCurrent`/`currentLink`/`releasesDir`/`flip`: where `current` and `releases` live under `AKROGON_HOME`.
- `tests/install.test.ts` — file-level `roots`, `skills` enumeration from `toolRoot`, `installEnv`, per-root cases.
- `tests/deploy-fixture.ts` — shared `roots`, `deployFixture`/`cli` plumbing.
- `tests/release-deploy.test.ts`, `tests/rollback.test.ts` — consumers of deploy-fixture `roots`.
- `tests/helpers.ts` — `fixture()` (HOME=AKROGON_HOME=f.home), `cli()`.
- `docs/start/install.md` line 72 — the four-root sentence.
- `learnings/LESSONS.md` — relevant history: `2026-09-11-stale-rule-in-docs` (grep docs for a changed list — done above, only install.md:72 hits) and `2026-11-12-check-evidence-scope` (named checks must really run the planned tests).

## Interfaces needed

None new. `planSkillLinks(home, sourceRoot, ownedRoots, listRoot?)` signature unchanged; consumers `install()` and the deploy `links` step need no edits.

## Checklist

| Unit | Owns | Depends on | Wave |
|------|------|-----------|------|
| U1 tests+product+docs | `tests/install.test.ts`, `tests/deploy-fixture.ts`, `src/install.ts`, `docs/start/install.md` | — | 1 (serial-solo) |

Order inside U1: test edits and deliberate-break red evidence first, test commit, then `src/install.ts` + `docs/start/install.md`.

## Credentials / grants

`state.yaml env_names: []`, design names no credential variables; `akrogon status` credential check: not applicable. `readiness.yaml grants: []` — no paid or live operation; the free-local check runs in this pass need no grant.

## Criterion proofs

### C1 — `<home>/.gemini/config/skills/<skill>` links to `skills/<skill>` for every skill, parents created, second install changes no link

- **T1**: `tests/install.test.ts` — `install creates all ... absent harness roots ...` extended via D2's roots constant (empty home covers the checkout path; literal `.gemini/config/skills` destination asserted) and `install from a listener release ...` gaining the literal agy assertion (release path). Proof command: `akrogon run-check --name c1-install -- bun test tests/install.test.ts`. Boundary: the real `install` command against a fixture HOME; state before = five roots absent, after = symlink per skill resolving to `skills/<skill>`; catches a product that drops the agy root.
- Conditions D1 must not break (checked by tracing `planned`/`stale`/`conflicts`):
  - Every skill folder gets a destination under the agy root with parent dirs created (`mkdirSync dirname` inside `applySkillLinks`) — case: T1's per-root `readdirSync`/`lstatSync`/`realpathSync` loop plus the literal `skills[0]` assertion.
  - A second install changes no link (repoint only when realpath differs; identical existing links are pushed unchanged and `applySkillLinks` no-ops on them) — case: T1's readlink snapshot equality across a second `cli install`.
  - Skills absent from `skills/` get no link — traced: destinations are generated only from `readdirSync(listRoot/skills)`; enumerating rather than copying means a missing folder cannot be planned.
- **Deliberate break**: remove `'.gemini/config/skills'` from `src/install.ts` `roots`. Expected red: T1 literal assertions and `readdirSync`/`lstatSync`/`realpathSync` on `.gemini/config/skills` fail; T2's agy cases fail. Discarded before the product commit.

### C2 — prune only dangling owned links and old-release links, keep real entries and foreign links, repoint owned links, refuse non-link/foreign-link destinations before writing

- **T2**: `tests/install.test.ts` — `install prunes only dangling owned links and preserves real entries and foreign links in every root` (extended roots + D4 release-link seed/assert), generated `install prunes before refusing directory|foreign-link at .gemini/config/skills ...`, `install repoints an owned link at .gemini/config/skills ...`. Proof command: `akrogon run-check --name c2-install -- bun test tests/install.test.ts`.
- Conditions on the mechanism:
  - Prune only dangling owned links at the agy root — case: D4's `stale-absolute`/`stale-relative`/`stale-nested`/`release-link` seeds removed while `real-directory`, `regular-file`, `resolving-foreign`, `dangling-foreign`, `sibling-prefix` survive.
  - Links into old releases pruned — case: D4 `release-link` seed under every root incl. `.gemini/config/skills`; deploy path: `release-deploy.test.ts` roots loop asserts the removed skill is gone from all five roots after a deploy.
  - Repoint an owned link — case: `install repoints an owned link at .gemini/config/skills` (owned = `toolRoot`-skills target, realpath-differs → `repoint: true`).
  - Refuse a non-link destination before writing any link — case: `prunes before refusing directory at .gemini/config/skills` asserts nonzero exit, destination kept, stale still pruned first, all other roots and `.local/bin` untouched.
  - Refuse a foreign-link destination before writing — case: the `foreign-link` kind at `.gemini/config/skills`, same ordering assertions; `target === link.source` stays a valid keep, a foreign non-owned target conflicts.
  - Deploy consumer behaves identically — case: `release-deploy.test.ts` every-link-resolves and rejected-deploy cases plus `rollback.test.ts` `expectRolledBack`, all iterating the extended D3 roots. Command: `akrogon run-check --name c2-deploy -- bun test tests/release-deploy.test.ts tests/rollback.test.ts`.
- **Deliberate break**: same D1 removal turns every `.gemini/config/skills` case red — the file's `roots` enumerator means none of the five named behaviors can silently skip the agy root.

## Red evidence at planning

Deliberate break applied: `'.gemini/config/skills'` removed from `src/install.ts` `roots` (comment marker), reverted after the red runs.

- `c1-install` (runs `tests/install.test.ts`, covers both criteria): red under break, exit 1, 8 fails — `prunes only dangling owned links ...`, `creates all ... absent harness roots ...`, `prunes before refusing directory at .gemini/config/skills`, `repoints an owned link at .gemini/config/skills`, `prunes before refusing foreign-link at .gemini/config/skills`, `from a listener release ...`, `self-update > fast-forwards ...`, `self-update > links a skill added on the remote ...`. `check c1-install: 1 .../check-c1-install-1795182729571-3230820.log`. After the fix: green, 33 pass — `check c1-install: 0 .../check-c1-install-1795182767272-3286294.log`.
- `c2-install`: the same `bun test tests/install.test.ts` run above; every agy case red under the break.
- `c2-deploy` (`tests/release-deploy.test.ts tests/rollback.test.ts`): red under break, exit 1, 6 fails — `every link resolves through current ...`, `a rejected add or remove deploy ...`, `the first deploy switches workspace-pointing links ...`, `rollback flips current ...`, `rollback restores the previous release skill links ...`, `an hc-to-hc rollback ...`. `check c2-deploy: 1 .../check-c2-deploy-1795182753982-3248137.log`. After the fix: green, 23 pass — `check c2-deploy: 0 .../check-c2-deploy-1795182803976-3335699.log`. One earlier post-fix run failed `rollback with a global config key the schema rejects fails naming file and key` on a 5s timeout (`check c2-deploy: 1 .../check-c2-deploy-1795182790340-3293117.log`): `git diff` holds no plausible cause (test untouched, no agy interaction), retry of the same command passed it in 295ms — recorded `inconsistent`.

Pre-red infrastructure note: the first `c1-install` run failed on missing `zod` in the fresh worktree; `bun install --frozen-lockfile --backend=copyfile` ran, then the red runs.

## Size and rerun

- Size: minutes (three bun test runs; deploy file is the slow one).
- Rerun trigger: any edit to `src/install.ts` `roots`/`staleIn`/conflict loop, `tests/deploy-fixture.ts` `roots`, or the named doc line; consumers replaying the record are implement (full `akrogon verify` on the leaf head) and B's review reading `plan.md`, the diff, and the verify receipt.

## Docs affected

- `docs/start/install.md:72` — add `~/.gemini/config/skills` to the root list. (Agent skill docs: none affected — no SKILL.md lists harness roots.)

# Plan: self-update

Scope source: brief.md done-criteria 1-9, design.md binding decisions (operator 1c + correction: `git fetch` then `git merge --ff-only`, never `git pull`). `debate: no` — synthesized directly. No design/brief conflicts found; design already carries the corrected step.

## Decisions

- D1: New module `src/self-update.ts` exports `selfUpdate(repo: Repo, ownRoot: string = toolRoot, home: string = homedir()): Promise<void>`. The function never throws; every outcome is exactly one `console.log` line. `ownRoot` is the design's identity-check seam; `home` is the skills-root seam — Bun's `os.homedir()` ignores `process.env.HOME` in-process (probed 2026-10-10), so tests that would otherwise link into the real `~/.claude/skills` must pass a fixture home.
- D2: Identity gate lives inside `selfUpdate` and is the first statement: `realpathSync(repo.root) === realpathSync(ownRoot)`, else silent return. This is the sole guard for criterion 5; all callers invoke unconditionally for their repo(s). The realpath pair is itself inside the step's catch-all so a vanished root degrades to a line, not a throw.
- D3: Step body, all under install lock then global lock in that order:
  1. `lockPath = resolve(repo.root, await command(['git','rev-parse','--git-path','akrogon-install.lock'], repo.root))`, then `withLock(lockPath, ...)` for the whole sequence.
  2. `git fetch <remote> <default_branch>` (repo.config names, cwd = repo.root). Failure → line, done.
  3. Branch/shape gate: `git symbolic-ref --short HEAD` (detached → failure), compare to `default_branch` (other branch → failure), then `git rev-list --left-right --count HEAD...<remote>/<branch>`: behind>0 & ahead=0 → fast-forward `git merge --ff-only <remote>/<branch>` inside `withLock(resolve(globalHome(), '.lock'))`; ahead>0 or both>0 → failure line naming `akrogon sync` as remedy; behind=0 & ahead=0 → proceed (the `current` path).
  4. On every run: `bun install --frozen-lockfile` (via `run`, cwd = repo.root), then link reconciliation (D4). Fast-forward is skipped per step 3, install and links still run; the first non-nominal outcome wins the line.
  5. Line: `deployed <old>..<new>` only when ff+install+links all succeeded; `current <sha>` when nothing to ff and install+links succeeded; else `<step> failed: <error>; <N|unknown> behind <remote>/<branch>; <remedy>` — remedy `akrogon sync` for ahead/diverged, "commit or finish the overlapping edit" for a refused ff, "remove the conflicting path" for link conflicts. SHAs are 12-char prefixes (matches `redOnBase.slice(0,12)` convention). Fetch failure omits the fetch to the ref: lag is `unknown` when `rev-list --count` cannot run.
- D4: `src/install.ts` split, keeping `install()` observable behavior byte-identical (its conflict tests pass unchanged):
  - `planSkillLinks(home, sourceRoot): { links: Link[]; conflicts: Link[] }` — prunes dangling owned links first, computes the conflict set, creates nothing.
  - `applySkillLinks(links): void` — the existing mkdir+symlink loop.
  - `install()` = plan → if conflicts, print `rm -r --` lines to stderr and throw as today → else apply → existing herdr calls. Prune-before-refuse order preserved because prune is inside plan.
  - `selfUpdate` = plan → `applySkillLinks(links minus conflicts)` → conflicts fold into the step's one line (printed, not thrown; non-conflicting links still land, covering criterion 6's added-skill case alongside a conflict).
- D5: `phaseCommand` return becomes `{ repo: Repo; committed: boolean; to?: Phase }`. `committedTo` is set by the existing `onCommitted` closure (`committed = true; committedTo = requested`); the hold (`committed = true` manual, redOnBase) and split paths commit no move and leave `to` undefined, so they correctly skip self-update. `MoveCommittedError` already carries `to`; `onCommitted`'s signature stays `() => void`. Callers that ignore the return (tests/merge-attempts.test.ts phaseBody) are unaffected.
- D6: `src/akrogon.ts` `phase` case: `committed` records `{ repo, to? }` from either `result` or `MoveCommittedError`; `mergeWake(readGlobal(), committed.repo, committed.to)`.
- D7: `mergeWake(global, repo, committedTo?: Phase, pressureDir)` — `await selfUpdate(repo)` is the first statement inside the existing `try`, before the pause-check `withLock`, gated on `committedTo === 'merged'`. Never-throw + inside-try means a hypothetical throw is only `report()`ed; merge results are structurally unchanged (criterion 7).
- D8: `nextCommand` calls `selfUpdate` after the `selection` computation and before the global-lock block (src/next.ts ~1447-1448), so its fetch and line precede dispatch output. Candidates: `input === '--all' || input === '--resume'` → every `registeredRepos(global, invocation).repos` (selfUpdate no-ops on non-self roots); `selection !== undefined` (manual next) → `selection.repo` only. Hooked events and `tab_closed` produce `selection === undefined` with non-all/resume input → no call, per the foreclosed per-pane triggers. The step's own failure/skip line is the criterion-8 behind line; `next` adds nothing.
- D9: Test seam strategy. Unit tests call `selfUpdate` directly with a bare-remote+clone fixture and a fixture `home`. Wiring tests for mergeWake/nextCommand use `mock.module` on `../src/self-update.ts` recording calls (pattern exists: next.test.ts mocks `../src/config.ts`), because a spawned CLI's `toolRoot` is the worktree, never a fixture root, and real reconciliation would write links into the real home. Criterion 5's "never runs" is proven by the unit-level identity test, not by asserting the mock was uncalled (callers do call it; it no-ops internally).
- D10: Link fixture: `tests/` gains a helper building root = `git clone` of a bare `remote.git`, a `package.json` with no dependencies and a real `bun.lock` generated by running `bun install` in the fixture once (offline thereafter under `--frozen-lockfile`). No clone of this repo.

## Read-first

- `issues/open/deploy-path/self-update/{brief,design,readiness}.yaml|md` — contract, binding decisions, proofs.
- `src/install.ts` — the function being split; conflict semantics are load-bearing for existing tests.
- `src/config.ts:170` (`toolRoot`), `:256-260` (`withSetup`/`akrogon-install.lock` idiom), `readRepo` (root is already realpath'd).
- `src/state.ts:194` — `withLock` (flock via spawned `sh`).
- `src/shell.ts` — `run`/`command`/`CommandError`/`Result`; use `run` where failure is a line, `command` where failure aborts to the catch-all.
- `src/phase.ts:122` (`MoveCommittedError`), `:132` (`commitMove`, `onCommitted` fires post-`saveState`), `:774-950` (`phaseCommand`; hold path ~847, culprit ~912, split ~937).
- `src/akrogon.ts:59-84` — phase-case wiring.
- `src/next.ts:1287-1302` (`mergeWake`), `:1437-1448` (selection → lock boundary), `registeredRepos` (~:195).
- `src/preflight.ts:4` — `trackingRef(repo)` for `<remote>/<branch>` naming.
- `tests/install.test.ts`, `tests/helpers.ts` (`fixture`, `cli`), `tests/next.test.ts` (`dispatchFixture`, `mock.module` precedent ~:1646), `tests/fake-herdr.ts`.
- `docs/guide/install.md:37-41` — the "git pull" block being replaced.
- `learnings/LESSONS.md` + `history/2026-10-01-failed-stop-guard-wording.md` (assert tokens/behavior, not prose) + `history/2026-09-27-stale-door-checkout.md` (the failure this leaf fixes).

## Units and waves

No shared test resources: each unit's fixtures are per-test tmp dirs (bare remote, clone, fixture home). Wave cap 3.

Wave 1:
- U1 `install-split` — owns `src/install.ts`. Split into `planSkillLinks`/`applySkillLinks` per D4; `install()` unchanged in behavior. Prereq: none.
- U2 `phase-committed` — owns `src/phase.ts`. `to?: Phase` on the result per D5. Prereq: none.
- U3 `guide` — owns `docs/guide/install.md`. Replace :37-41: landed work deploys itself on the next merge landing or `akrogon next` run (fetch, fast-forward, `bun install`, link reconciliation, one printed line); operator still acts when the line reports the checkout on another branch, diverged (`akrogon sync`), ahead, or blocked by an uncommitted overlapping edit. No `git pull` instruction remains. Prereq: none.

Wave 2:
- U4 `self-update-module` — owns `src/self-update.ts`, `tests/install.test.ts` (new self-update tests appended; existing tests untouched). Implements D1-D4. Prereq: U1 (imports the split).

Wave 3:
- U5 `wiring` — owns `src/akrogon.ts`, `src/next.ts`, `tests/next.test.ts`. Implements D6-D8; mergeWake/nextCommand tests via mocked self-update per D9. Prereq: U2 (phase result field) + U4 (self-update module exists for the real import).

Docs: `docs/guide/install.md` updated (U3). No skill text, AREA.md, README or other agent-facing doc changes — the step is invisible to seats.

## Verification

Checks (config): `bun run format`; `bun run typecheck`; `bun test --timeout=30000` (full suite — install.test.ts/next.test.ts regressions only surface there; minutes, rerun after any src/tests edit).

| Criterion | Proof command | Failure it catches | Size |
|---|---|---|---|
| 1 ff keeps unrelated edit, prints `deployed` | `bun test tests/install.test.ts -t self-update` — clone reset behind, unrelated dirty file, assert ff result, edit intact, line | step skipping ff, clobbering the edit, wrong line | seconds |
| 2 overlapping edit blocks ff | same file — dirty file overlapping incoming change; assert HEAD/tree unchanged, line carries step+git error+lag+remedy | step forcing/overwriting, missing remedy | seconds |
| 3 other branch / detached / ahead / diverged | same file — four fixture shapes; assert no ref move, reported line; ahead+diverged name `akrogon sync` | step checking out, stashing, merging anyway | seconds |
| 4 failed install/link retries next trigger | same file — corrupt `bun.lock` then restore; first run reports failing step, second run reports `current`/`deployed` | pending-state residue, swallowed failure | seconds |
| 5 consumer repo never runs step | same file — `selfUpdate` with `repo.root != ownRoot`; assert silent return, no fetch (remote's reflog/mtime untouched), zero output | identity check missing or on name not realpath | seconds |
| 6 skill add/remove/conflict | same file — fixture `home` with stale owned link (removed skill), new skill dir on remote after ff, conflicting real directory; assert new link, pruned stale link, conflict in the line, no throw | reconcile throwing, missing prune, missing create | seconds |
| 7 merge/next result unchanged on step failure | `bun test tests/next.test.ts -t self-update` — real `selfUpdate` is unmockable-failing only via injectable failure; assert `phase ... merged` still prints `moved merged`/exit 0 and `next` dispatch unchanged (mocked module that throws is inside the never-throw contract's caller-side try) | selfUpdate throwing out of mergeWake/nextCommand, blocking merge wake | seconds |
| 8 next behind line | `tests/next.test.ts` — mocked self-update asserts called with the selected/registered repo before dispatch; `tests/install.test.ts` unit asserts the behind line content after fetch with ff skipped | next never calling the step, line absent | seconds |
| 9 guide updated | `bun test tests/docs-links.test.ts` + review: install.md has no `git pull` instruction and describes self-update triggers/remedies | stale instruction left, broken anchor | seconds |

Deliberate-break evidence (standing design): criterion-1 test goes red when `selfUpdate`'s ff call is disabled. No `merge_checks` added; brief names none.

## Notes

- Stated limit (design): an already-running seat keeps its loaded code and skill text; deployment reaches the next invocation.
- Env/credentials: readiness.yaml `inputs`/`produces`/`grants` are empty and `akrogon status self-update` shows no `Missing:` lines — no operator action needed.
- Accepted cost (design): unmerged edits in the root stay live for every seat, as before.

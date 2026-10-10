# Sub-brief 4: self-update-module (plan U4, wave 2)

## 1. Goal

New `src/self-update.ts` implementing the self-update step, plus its tests appended to `tests/install.test.ts`. Plan decisions D1, D2, D3, D9, D10. Depends on wave-1 `src/install.ts` split (already on the lane): it exports `planSkillLinks(home, sourceRoot): { links, conflicts }`, `applySkillLinks(links)`, and `Link`.

## 2. Acceptance criteria

Map to brief.md done-criteria 1-6 (criterion 7/8 live in the wiring unit).

Signature:
```ts
export async function selfUpdate(
  repo: Repo,
  ownRoot: string = toolRoot,
  home: string = homedir(),
): Promise<void>;
```
Behavior, in order:
1. Identity: `realpathSync(repo.root) === realpathSync(ownRoot)`, else return silently with no output and no effects. The whole body including this check is inside a try/catch so nothing ever propagates.
2. Install lock for the whole sequence: `resolve(repo.root, await command(['git','rev-parse','--git-path','akrogon-install.lock'], repo.root))`, `withLock` around everything after.
3. `git fetch <remote> <default_branch>` (names from `repo.config`, cwd `repo.root`). Failure → print line, done.
4. Shape gate: `git symbolic-ref --short HEAD` (nonzero → detached). Branch !== default_branch → skip line. Else `git rev-list --left-right --count HEAD...<remote>/<default_branch>` → `ahead<TAB>behind`. behind>0 && ahead===0 → `git merge --ff-only <remote>/<default_branch>` under `withLock(resolve(globalHome(), '.lock'))` (lock order: install, then global — only around the ff). ahead>0 (with or without behind) → skip line naming `akrogon sync` as remedy.
5. On every run after step 3 (even when ff was skipped or refused): `bun install --frozen-lockfile` via `run` in `repo.root`, then `planSkillLinks(home, ownRoot)` + `applySkillLinks(links minus conflicts)`; conflicts fold into the line.
6. Exactly one `console.log` line per call:
   - `deployed <old12>..<new12>` only when ff + install + links all clean (12-char SHAs).
   - `current <sha12>` when nothing to ff and install + links clean.
   - Otherwise: failing step name (`fetch`, `fast-forward`, `install`, `links`), the git/bun error text (first line of stderr is enough), lag `<N|unknown> behind <remote>/<branch>`, and remedy: `akrogon sync` for ahead/diverged; commit or finish the overlapping edit for a refused ff; remove the conflicting path(s) for link conflicts; retry happens at next trigger for fetch/install. For skips: `self-update skipped: <reason>` with lag when computable. Use `run` (never `command`) for the step's own git/bun calls where failure is a line; `command` is fine where a throw lands in the catch-all line.
   - First non-nominal outcome wins the single line.
7. Every failure path leaves the root untouched in ways forbidden by the design: never checkout/stash/reset/rebase, never a non-ff merge, never alters caller results.

## 3. Read-first

- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`
- `src/install.ts` — post-split helpers (on your worktree's HEAD via the lane; if the split is not yet visible in your worktree, see section 4 note).
- `src/config.ts` — `toolRoot` (~:170), `globalHome` (~:174), `Repo` type.
- `src/state.ts:194` — `withLock`.
- `src/shell.ts` — `run`, `command`, `Result`, `CommandError`.
- `tests/install.test.ts` top — imports/style to extend; `tests/helpers.ts` `fixture()` shape for repo+remote pattern reference (you build your own bare-remote+clone, not `fixture()`).
- `tests/chart-shapes.test.ts:36-63` — precedent for `process.env.AKROGON_HOME` set/restore in-process.

## 4. Change list and needed interfaces

Owns: `src/self-update.ts` (new), `tests/install.test.ts` (append new `self-update` describe/tests at the end; do not modify existing tests).
Consumed: `planSkillLinks`, `applySkillLinks`, `Link` from `./install`; `withLock` from `./state`; `run`, `command`, `Result` from `./shell`; `toolRoot`, `globalHome`, `Repo` from `./config`; `realpathSync`, `homedir`.
Tests must set `process.env.AKROGON_HOME` to a fixture dir (for the global lock path) and restore it after — `.lock` under that dir is fine. In-process `console.log` capture: replace `console.log` with a collector and restore in finally.
Test fixture per test (tmp under `mkdtempSync`): bare `remote.git`, `clone` as the root; clone contains `skills/<name>/` dirs, `package.json` with `{}`-dependencies, and a real `bun.lock` produced by running `bun install` once in the fixture during setup (frozen installs thereafter run offline). `ownRoot = repo.root = <clone>`; `home = <fixture home>`.

## 5. Do-not, reasons and exceptions

- Do not touch `install.ts`, `phase.ts`, `akrogon.ts`, `next.ts`, docs, or other test files — owned scope above.
- Do not call herdr or plugin commands, add config keys/flags/commands/state fields, add retry loops or pending state — design exclusions.
- Do not mock git or bun inside these tests — standing design requires real repos and a real `bun install --frozen-lockfile`.
- Do not `checkout`/`stash`/`reset`/`rebase`/`git merge` non-ff in implementation or tests — foreclosed.
- If the consumed install.ts split differs from section 4's signatures, return a mismatch; the exception is a revised brief from A.

## 6. Ordered steps

Derive tests before code. Size: ~2 files, ~12 turns.
1. Write tests in `tests/install.test.ts` covering: (a) behind + unrelated dirty file → ff, edit kept, `deployed <old>..<new>`; (b) overlapping dirty file → nothing changes, line names `fast-forward` + git error + lag + remedy; (c) other branch, detached HEAD, ahead, diverged → four cases, untouched refs, reported, `akrogon sync` named for ahead/diverged; (d) corrupt `bun.lock` → `install` failed line; restore → next call prints `current`; (e) `ownRoot` pointing elsewhere → silent no-op (spy on console.log, assert zero calls, and point remote at a deleted path so a fetch would visibly fail); (f) remote adds skill dir + removes another → after `deployed`, new skill linked in fixture home, stale owned link pruned; a pre-existing real directory at a skill destination → named in the line, not thrown, other links still created.
2. Deliberate break: comment out the `git merge --ff-only` call in your implementation once, confirm test (a) goes red, restore.
3. Implement `src/self-update.ts`.
4. Run `bun install` in your worktree if needed, then section-7 commands.
5. Commit each file separately or together; commits changing `tests/install.test.ts` carry a `Test-Change: tests/install.test.ts added self-update cases; no existing expectation changed` trailer.

## 7. Commands

```
AKROGON_BASE=9e2dfbebcfd98e647d34bed995741410ce95c2e4 bun test --changed=9e2dfbebcfd98e647d34bed995741410ce95c2e4 --timeout=30000
bun test tests/install.test.ts --timeout=30000
bun run typecheck
```

## 8. Done-when, evidence and report

All criteria (a)-(f) green including the deliberate-break note with its red evidence. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

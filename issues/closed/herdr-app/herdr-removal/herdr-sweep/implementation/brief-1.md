# Brief 1: install, deploy and Tasks mod (U1)

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/herdr-sweep-u1` (detached at the leaf head `b39d82fd`). Leaf plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-app/herdr-removal/herdr-sweep/plan.md` (D1, D2, D3, D11).

## 1. Goal

After this unit, `akrogon install` and deploy make no `herdr` call, link no herdr-app mod, and still remove the old `~/.config/herdr-app/mods/tasks` link. akrogon's Tasks mod and its tests are deleted. Decisions D1, D2, D3, D11.

## 2. Acceptance criteria

1. `src/install.ts` and `src/self-update.ts` contain no `herdr` argv: `shipsPlugin`, the `herdr integration install` / `herdr plugin link` branch of `linkServices`, and `unlinkPlugin` (its call in `install` and deploy's `unlink` step) are gone. `linkServices` takes no parameter; `install` and deploy call `linkServices()` (D1).
2. `planSkillLinks` no longer lists `herdr-app/` mods or plans `~/.config/herdr-app/mods/<mod>` links. It keeps the one `staleIn(resolve(home, '.config/herdr-app/mods'), sourceMods, resolve(listRoot, 'herdr-app'), modRoots)` call with `modRoots` and `sourceMods`, so an akrogon-owned link there whose target is gone is pruned, and real folders and foreign links stay (D2).
3. `herdr-app/` (all of `herdr-app/tasks/`), `tests/tasks-mod.test.ts` and `tests/tasks-mod-host.test.ts` are deleted (D3).
4. The planned tests already committed are green: `tests/install.test.ts` and `tests/deploy-shapes.test.ts` (33 tests). They were shown green at planning against exactly this change.
5. `tests/self-update.test.ts` no longer sets up a fake herdr (lines about `fake-herdr.ts`, `FAKE_HERDR`, `herdr.json` near 71-89), because deploy makes no herdr call. `tests/release-deploy.test.ts` drops the two lines at 193-194 that read `herdr.json.calls` and expect a `plugin link` call (deploy-shapes now proves no herdr call). Both files stay green.
6. `tests/deploy-fixture.ts` keeps its `plugin/` seed (D11, the rollback guard test needs a plugin release). Do not touch `tests/deploy-fixture.ts`, `tests/helpers.ts` or `tests/fake-herdr.ts` (unit U2 owns them).

## 3. Read first

- `src/install.ts` (whole file, 194 lines), `src/self-update.ts:215-300` (`deployStage`).
- `tests/install.test.ts`, `tests/deploy-shapes.test.ts` (the planned tests; read only).
- `tests/self-update.test.ts:60-95`, `tests/release-deploy.test.ts:160-200`.
- `/home/ivan/.claude/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- `src/install.ts`: remove `mods` listing (lines 31-35) and the `...mods.map(...)` planned links (48-51); keep `modRoots`, `sourceMods` and the mods `staleIn` call (87). Remove `shipsPlugin`, the plugin branch in `linkServices`, `unlinkPlugin`. `linkServices(): Promise<void>` runs `systemctl --user daemon-reload` then, when the release ships the listener unit, `systemctl --user enable akrogon-listener.service`. `install()` ends with `applySkillLinks(links); await linkServices(); await restartListener();`. Drop imports left unused (check `readdirSync` is still used by the skills listing; `global.harnesses` is no longer read in `install`, but `readGlobal()` is still used for `repos`).
- `src/self-update.ts`: import without `unlinkPlugin`; `await step('reload', () => linkServices());`; delete the `unlink` step line.
- Delete `herdr-app/`, `tests/tasks-mod.test.ts`, `tests/tasks-mod-host.test.ts` with `git rm -r`.
- `tests/self-update.test.ts`: delete the fake herdr setup and its cleanup lines only.
- `tests/release-deploy.test.ts`: delete the two `plugin link` call lines only (and an import made unused by that, if any).
- Prerequisites: none. Owned paths: the files above. Shared test resource: none. Unit U3 edits docs and AREA files in parallel; do not touch `README.md`, `docs/`, `skills/`, `*AREA.md`, `learnings/`.

## 5. Do-not, reasons and exceptions

- Do not edit `tests/install.test.ts` or `tests/deploy-shapes.test.ts`: they are the planned criterion tests. If one is red once the code is correct, return a mismatch with the failing output.
- Do not add tests or cases. The only test edits allowed are the deletions in criteria 3 and 5, which the leaf brief requires ("tests: `tests/fake-herdr.ts`, herdr fixtures and tests of removed behavior, each deletion with its reason").
- Do not touch `src/rollback.ts`: its plugin guard stays (design: deleted only after no pre-hc release remains).
- Do not touch `src/shell.ts`, `tests/helpers.ts`, `tests/deploy-fixture.ts`, `tests/isolation.ts`, `tests/fake-herdr.ts`: unit U2 owns them and lands after you.
- Do not reword comments outside the lines you change; U2 and U3 own wording.
- Do not run `bun run format` (it rewrites drift in untouched files); run `bunx prettier --write` only on files you changed.
- Any scope or interface change: return a mismatch with evidence; the exception is a revised brief from A.

Reasons restated: the planned tests are A's contract; test additions are forbidden at implement; the rollback guard is locked; U2's files would conflict; format drift creates noise. Exception: a revised brief from A.

## 6. Ordered steps

1. `src/install.ts` and `src/self-update.ts` per section 4 (criteria 1, 2).
2. `git rm -r herdr-app tests/tasks-mod.test.ts tests/tasks-mod-host.test.ts` (criterion 3).
3. `tests/self-update.test.ts` and `tests/release-deploy.test.ts` deletions (criterion 5).
4. Install deps once: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`.
5. Run the section 7 commands; all green.
6. Commit once (message below).

Advisory size: about 7 files, under 30 turns.

## 7. Commands

- `akrogon run-check --name u1-tests -- bun test --timeout=30000 tests/install.test.ts tests/deploy-shapes.test.ts tests/self-update.test.ts tests/release-deploy.test.ts tests/rollback.test.ts`
- `akrogon run-check --name u1-typecheck -- bun run typecheck` (this may report errors only in files U2 owns if any reference something you removed; report them, do not fix them in U2's files).
- `akrogon run-check --name u1-format -- bunx prettier --check src/install.ts src/self-update.ts tests/self-update.test.ts tests/release-deploy.test.ts`

## 8. Done-when, evidence and report

Done when criteria 1-6 hold and the three commands pass, each cited by its `check <label>: <exit> <path>` line.

Commit message: `fix: install and deploy make no herdr call and link no herdr-app mod` with a body naming D1-D3, and this final trailer block (one line per changed old test file):

```
Test-Change: tests/tasks-mod.test.ts deleted: brief "the Tasks mod: herdr-app/tasks/, tests/tasks-mod.test.ts, tests/tasks-mod-host.test.ts" (forks/config.md Q2); the mod is deleted
Test-Change: tests/tasks-mod-host.test.ts deleted: same brief item; the mod is deleted
Test-Change: tests/self-update.test.ts brief "tests: tests/fake-herdr.ts, herdr fixtures ...": fake herdr setup removed, deploy makes no herdr call (D1); no expectation changed
Test-Change: tests/release-deploy.test.ts brief "tests: ... tests of removed behavior": plugin link call assertion removed, deploy makes no herdr call (D1); tests/deploy-shapes.test.ts proves no call
```

Do not add a co-author line.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

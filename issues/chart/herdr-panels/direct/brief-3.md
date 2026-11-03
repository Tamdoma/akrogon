# Brief U3: mods/files-view (Files clone: filter, Recent, markdown, worktree pin)

## 1. Goal

Build `mods/files-view/`, a clone of herdr-app's shipped `files` mod. Plan decisions D1, D2, D11, D12 in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md`. Leaf contract: `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/files-panel/{brief,design}.md` (read both).

## 2. Acceptance criteria

1. `bun test tests/files-view.test.js` passes (planned test, not edited by you). It fixes `mods/files-view/paths.js` exports: `parseLsFiles(zOut)`, `filterPaths(paths, query)` (case-insensitive substring, empty query → `[]`, at most 200), `recent(statusZ, logNames, exists)` (uncommitted paths in porcelain `-z` order first, then names from `git log -20 --name-only --format=` that still exist, de-duplicated), `parseWorktrees(porcelain) → [{folder, branch|null}]`, `slugOf(folder)`.
2. `herdr-app check mods/files-view` passes.
3. First open looks like today's Files view (tree, preview) plus one header control row: a filter input, a Recent button and a pin label. The outer card has no `rounded(10)` and no `border_1`; rows keep their small rounding.
4. Filter: lists matching paths from `git ls-files -co --exclude-standard -z` in the shown root (closed folders included, ignored left out); clicking a result opens it like a tree click. Hidden when `git rev-parse --show-toplevel` fails in the shown root.
5. Recent: a list of `recent(...)` over `git status --porcelain -z` and `git log -20 --name-only --format=` in the shown root, `exists` checked with `readTextFile` or an `exec("test", ["-e", path])`; clicking opens the file.
6. A `.md` file opens formatted with `TextView.markdown(id, text)` imported from `gpui-base` (not `gpui-kit`); a Raw toggle in the preview header shows the shipped source view and switches back.
7. Pin: the pin label shows the pinned worktree's slug with ×, or a picker label when unpinned. The picker lists `parseWorktrees(git worktree list --porcelain)` of the shown root's repo; picking sets `shared("worktree.pin")[spaceId] = {machine: null, folder}` (copy the object, then `setShared`); × deletes that space's entry. While pinned, the panel shows that folder instead of following the focused pane; another space is unaffected. A space without an entry follows the focused pane as today.
8. When the pinned folder no longer exists, the panel shows "<slug> worktree is gone" (`slugOf(folder)`) in place of the tree until × or another pick.
9. An open file re-reads when it changes on disk (`watchFolder` on its folder; check how the shipped mod refreshes).
10. All git reads use the shipped mods' no-lock read flags (`READ` in `~/.config/herdr-app/mods/changes/main.js`).

## 3. Read first

- `~/.config/herdr-app/mods/files/main.js` (169 lines) and its folder (svgs), `~/.config/herdr-app/mods/changes/main.js` (for `READ` and git exec patterns).
- `~/.config/herdr-app/herdr.d.ts` (exec, readTextFile, watchFolder, shared/setShared, spaces, focused, panes), `~/.config/herdr-app/AGENTS.md` mods sections, `~/.config/herdr-app/gpui-kit.d.ts` for input fields.
- `grep -n "markdown" ~/.config/herdr-app/gpui-kit.d.ts` and gpui-base typings next to it for `TextView.markdown`.
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `mods/files-view/mod.json`: the shipped files `mod.json` plus `"place": "none"` and `"cloned_from": {"name": "files", "version": "0.1.12"}` (keep its title as is).
- New `mods/files-view/main.js`, `mods/files-view/paths.js` (pure, no `herdr`/`gpui` imports), copied svgs.
- Owned: `mods/files-view/**` only. `mods/changes-view` (another worker, U4) carries a verbatim copy of `parseWorktrees` and `slugOf` (herdr-app refuses imports across mod folders); keep those two functions small and self-contained.
- Contract: `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })`, `machine: null` = this machine. akrogon's Tasks mod also writes it.

## 5. Do-not, reasons and exceptions

- Do not edit `layouts/`, other mods or `tests/`: A owns them and tests are locked; a wrong or red planned test is a mismatch returned with evidence.
- Do not open herdr-app windows, sessions, `herdrapp`, `herdr-app do|shot` or `hc`: live checks share one display and run serially by A.
- Never create, rename, move or delete anything under `~/.config/herdr-app/`; read only.
- Do not change the shipped `files` mod; the clone is `files-view`.
- Reasons: locked tests, one display, the operator's live config. Exception: a revised brief from A.

## 6. Ordered steps

1. `paths.js` until `bun test tests/files-view.test.js` is green.
2. Clone `files/main.js`; add criteria 3-10.
3. `herdr-app check mods/files-view`.
4. Commit your paths only.
Advisory size: about 5 files, under 30 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon`:

- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u3-test -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u3 && bun test tests/files-view.test.js"`
- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u3-check -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u3 && herdr-app check mods/files-view"`

## 8. Report

Return the commit id(s) and cite the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

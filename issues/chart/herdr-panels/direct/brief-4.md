# Brief U4: mods/changes-view (Changes clone: Working | Branch | Commits, no Commit, worktree pin)

## 1. Goal

Build `mods/changes-view/`, a clone of herdr-app's shipped `changes` mod. Plan decisions D1, D2, D12, D13 in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct/plan.md`. Leaf contract: `/home/ivan/Work/infra/herdr-setup/issues/open/right-panel/changes-panel/{brief,design}.md` (read both).

## 2. Acceptance criteria

1. `bun test tests/changes-view.test.js` passes (planned test, not edited by you). It fixes `mods/changes-view/git.js` exports: `LOG_FORMAT` (the `git log --format=` string, e.g. `%H%x1f%P%x1f%s%x1e`), `EMPTY_TREE` (`4b825dc642cb6eb9a060e54bf8d69288fbee4904`), `resolveBase({originHead, branches})` (`originHead` like `refs/remotes/origin/trunk` → `origin/trunk`; else `main`, else `master`, else `null`), `parseLog(out) → [{sha, parents, subject}]`, `diffRange(commit) → [from, to]` (first parent, or `EMPTY_TREE` for a root).
2. `herdr-app check mods/changes-view` passes.
3. First open matches today's Changes Working view without the Commit message and button (`commit()` with `git add -A`/`git commit -m` and its row are removed), plus a header switch Working | Branch | Commits and the pin label. No outer `rounded(10)`/`border_1`.
4. Branch: base from `resolveBase` over `git symbolic-ref -q refs/remotes/origin/HEAD` and `git branch --format=%(refname:short)`; diff = `git diff <merge-base base HEAD> <HEAD>`, with the base SHA and HEAD SHA read once per refresh and used for both the file list and each file's diff; the header names the base. With nothing beyond the base it says "nothing on this branch beyond <base>". No base: says so, never guesses.
5. Commits: `parseLog(git log -20 --format=LOG_FORMAT)` as a list; clicking one shows its files and diff over `diffRange(commit)` (a merge against its first parent, the root against the empty tree).
6. An empty Working view on a branch with commits beyond the base shows "view Branch diff (N files)"; clicking it switches to Branch.
7. Pin: same contract and look as `mods/files-view` (another worker builds it at the same time): label with slug and × when pinned, picker over `git worktree list --porcelain` when not; picking sets `shared("worktree.pin")[spaceId] = {machine: null, folder}` (copy the object, then `setShared`); × deletes the entry; while pinned the panel shows that folder's changes in this space only; a pinned folder that no longer exists shows "<slug> worktree is gone". Put `parseWorktrees(porcelain) → [{folder, branch|null}]` and `slugOf(folder)` (last path segment, trailing slash ignored) in `git.js`: herdr-app refuses imports across mod folders, so this mod carries its own copy.
8. Every git read keeps the shipped `READ` no-lock flags.

## 3. Read first

- `~/.config/herdr-app/mods/changes/main.js` (206 lines) and its folder.
- `~/.config/herdr-app/herdr.d.ts` (exec, shared/setShared, spaces, focused, panes, watchFolder), `~/.config/herdr-app/AGENTS.md` mods sections.
- `/home/ivan/Work/infra/akrogon/skills/implement-issue/ponytail.md`.

## 4. Change list and interfaces

- New `mods/changes-view/mod.json`: the shipped changes `mod.json` plus `"place": "none"` and `"cloned_from": {"name": "changes", "version": "0.1.12"}`.
- New `mods/changes-view/main.js`, `mods/changes-view/git.js` (pure, no `herdr`/`gpui` imports), copied svg.
- Owned: `mods/changes-view/**` only. Contract: `setShared("worktree.pin", { [spaceId: string]: { machine: string | null, folder: string } })`.

## 5. Do-not, reasons and exceptions

- Do not edit `layouts/`, other mods or `tests/`: A owns them and tests are locked; a wrong or red planned test is a mismatch returned with evidence.
- Do not open herdr-app windows, sessions, `herdrapp`, `herdr-app do|shot` or `hc`: live checks share one display and run serially by A.
- Never create, rename, move or delete anything under `~/.config/herdr-app/`; read only.
- Do not change the shipped `changes` mod; the clone is `changes-view`.
- Reasons: locked tests, one display, the operator's live config. Exception: a revised brief from A.

## 6. Ordered steps

1. `git.js` until `bun test tests/changes-view.test.js` is green.
2. Clone `changes/main.js`; remove Commit; add criteria 3-8.
3. `herdr-app check mods/changes-view`.
4. Commit your paths only.
Advisory size: about 4 files, under 30 turns.

## 7. Commands

From `/home/ivan/Work/infra/akrogon`:

- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u4-test -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u4 && bun test tests/changes-view.test.js"`
- `akrogon run-check --holder /home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/direct --name u4-check -- sh -c "cd /home/ivan/.akrogon/worktrees/herdr-setup/right-panel-u4 && herdr-app check mods/changes-view"`

## 8. Report

Return the commit id(s) and cite the `check <label>: <exit> <path>` lines.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

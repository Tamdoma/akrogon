# Files and Changes (A1, A2, A3) — Blind Notes (Seat D)

## 1. Keep existing interfaces simple (`herdr-setup/mods/` clones vs layout & visible changes)

- **(1) Pick with reason and cost**
  - **Pick**: Clone the shipped `files` and `changes` mods into `/home/ivan/Work/infra/herdr-setup/mods/files/main.js` and `/home/ivan/Work/infra/herdr-setup/mods/changes/main.js`, keeping the existing `"files"` and `"changes"` IDs in `/home/ivan/Work/infra/herdr-setup/layouts/flat.json:134,141` (**zero new top-bar buttons** beyond `Tasks`, `Needs you`, `Files`, `Changes`). Preserve their current layout and interaction (`files/main.js:158-168`, `changes/main.js:179-205`), making only four compact, low-noise additions:
    1. **Header checkout/worktree pill (both mods)**: The right-aligned folder/branch label in `files/main.js:163` and `changes/main.js:186` becomes a clickable pill (`main ▾` when following the focused pane; `wt: <slug> ×` when pinned to a worktree) plus a small `[↗]` button to open the current file/diff in a full-height split pane.
    2. **Files header & top bar**: When viewing a `.md` file (`files/main.js:160-167`), render Markdown by default with a `[Raw]` toggle pill in the header (`←  Files   [Raw] [↗] INTAKE.md`). At the top of the folder tree (`files/main.js:164`), add a compact 1-line filter bar (`[Filter files…] [Recent]`).
    3. **Changes header**: Add a compact 3-way scope pill (`Working | Branch | Recent`, default `Working`) in the header row (`changes/main.js:183-186`).
    4. **Changes bottom bar & list height**: Remove the bottom `Commit message` input and `Commit` button (`changes/main.js:202-204`), reclaiming `52px` of vertical space, and relax the `200px` file-list cap (`changes/main.js:187`) to `260px` (or collapsible file list when viewing a long diff).
  - **Reason**: Honors the operator's constraint in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Round 2`: *"I don't want to be complicating the existing interfaces. I like what they are today"*) while solving F2, F3, F4, F5, and A3 in place without touching `/home/ivan/.config/herdr-app/mods/`.
  - **Cost**: Two cloned mods (`~230` LOC each) under `/home/ivan/Work/infra/herdr-setup/mods/files/` and `/home/ivan/Work/infra/herdr-setup/mods/changes/` (`package.json` + `main.js`), symlinked into `~/.config/herdr-app/mods/` only on deploy.

- **(2) Rejected options with reasons**
  - **Adding separate top-bar tabs (`Worktrees`, `Branch Diff`, `Markdown`)**: Rejected; overflows the `368px` right-panel tab bar (`/home/ivan/Work/infra/herdr-setup/layouts/flat.json:112-151`) and violates the settled 4-button top bar (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Round 1`, `## Round 2`).
  - **Editing `/home/ivan/.config/herdr-app/mods/files/main.js` or `changes/main.js` directly**: Rejected; violates the repo boundary in `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Scope`) and gets overwritten by Herdr app updates.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/files/main.js:158-168` — current `Files` layout (`h_flex` header with `←`, `"Files"`, folder/file name, followed by `v_virtual_list` tree or readonly `Editor`).
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/changes/main.js:179-205` — current `Changes` layout (`h_flex` header with `"Changes"`, file count, `+add −del`, `200px`-capped file list, `v_virtual_list` diff, and bottom `Commit` bar).
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Round 2`, `## Round 3`) — operator requirement to keep existing interfaces simple and link Tasks leaf rows to `Files` and `Changes`.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Header crowding on the `368px` right dock (`/home/ivan/Work/infra/herdr-setup/layouts/flat.json:112`) if scope labels, stats, and worktree names all share one row.
  - **Removal**: Keep the main header row to `Title + Scope/Mode pills + [↗] + truncated checkout pill (max 110px)`, and move `+add −del` / `N files` onto the subheader or tooltip when `Branch` / `Recent` is active.

- **(5) Unasked question**
  - *Should `Files` and `Changes` share one worktree selection per space or maintain independent worktree selections?*
  - **Answer**: Share one per-space key (`shared("workspace.worktree")?.[spaceId]`), so clicking `"Files"` or `"Changes"` on a Tasks leaf row (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Round 3` item 2a) or switching checkouts in `Files` immediately aligns `Changes` to the same checkout without picking twice.

---

## 2. Changes: Commit button (F3) and commit/branch scopes (F2)

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Remove the `Commit` button and `Commit message` input bar completely** (`/home/ivan/.config/herdr-app/mods/changes/main.js:151-166,202-204`).
    2. **Add a 3-way scope selector (`Working | Branch | Recent`) in the header, defaulting to `Working`**:
       - **`Working` (default)**: Uncommitted changes (`git status --porcelain=v1 -z --no-renames --untracked-files=all` + `git diff HEAD --numstat -z --no-renames`, `/home/ivan/.config/herdr-app/mods/changes/main.js:75-82`), plus a muted subtitle showing the last commit (`HEAD` short SHA, subject, relative age) when the working tree is clean so an agent's just-committed work is never invisible.
       - **`Branch` (`vs main/master`)**: Resolves the base ref (`git symbolic-ref -q --short refs/remotes/origin/HEAD` with fallback to `main` / `master`) and merge-base (`git merge-base HEAD <base>`), then lists all files and line stats across the branch (`git diff --name-status -z --no-renames <mergeBase>...HEAD` and `git diff --numstat -z --no-renames <mergeBase>...HEAD`) and renders the per-file diff via `git diff --no-color --no-ext-diff --unified=3 <mergeBase>...HEAD -- <path>`.
       - **`Recent` (recent commits)**: Lists the last 15 commits on `HEAD` (`git log -n 15 --format=%H%x09%h%x09%cr%x09%s`) in a compact selector above the file list; selecting a commit (defaulting to `HEAD`, the most recent commit) populates the file list (`git diff-tree --no-commit-id -r --name-status -z <sha>` + `--numstat`) and per-file diff (`git show --format= --unified=3 <sha> -- <path>`).
  - **Reason**: In an agent-driven workflow (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Agent findings` F2, F3), agents commit their own work before reporting completion and the operator commits from the terminal or via `akrogon`. Removing `commit()` (`git add -A` at `/home/ivan/.config/herdr-app/mods/changes/main.js:157`) completely eliminates the F3 bug (sweeping `issues/*.jsonl` and concurrent agent edits into a commit), avoids cluttering every file row with staging checkboxes, and reclaims `52px` of vertical height for the diff view. Defaulting to `Working` preserves the exact current behavior while making `Branch` (full leaf/worktree review before merge) and `Recent` (what the agent just committed) 1 click away.
  - **Cost**: `~85` LOC in `/home/ivan/Work/infra/herdr-setup/mods/changes/main.js` using the existing `READ` git flags (`--no-optional-locks`, `/home/ivan/.config/herdr-app/mods/changes/main.js:14`) and `parseDiff()` parser (`changes/main.js:16-54`).

- **(2) Rejected options with reasons**
  - **Keep the Commit button and add per-file checkboxes (`git add -- <selected>`)**: Rejected; adds UI noise to every row in a `368px` panel for an action the operator does not use when reviewing agent work (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Agent findings` F3, `## Round 2`).
  - **Keep `git add -A` with `:!issues/` pathspec exclusions**: Rejected; still sweeps unrelated untracked scratch files or concurrent edits in a shared checkout.
  - **Default to `Branch` instead of `Working`**: Rejected; on `main` (where `merge-base HEAD main` equals `HEAD`), `Branch` is always empty, breaking the operator's expectation that `Changes` works like today (`Working`) unless switched.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/changes/main.js:151-166` — `commit()` runs `git add -A` (`line 157`) then `git commit -m` (`line 160`) with no path filtering.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/changes/main.js:75-149` — `refresh()` and `loadDiff()` only inspect uncommitted state (`git status` and `git diff HEAD`), showing `"No changes"` (`line 189`) as soon as an agent commits.
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Agent findings` F2, F3, F5) — documents that agents commit their own work, `git add -A` sweeps `issues/*.jsonl`, and the `200px` list / narrow diff column is cramped.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: Running `git merge-base HEAD main` fails in repos whose default branch is `master` or when detached without `origin/HEAD`.
  - **Removal**: Probe `git rev-parse --verify --quiet refs/heads/main`, then `refs/heads/master`, then `refs/remotes/origin/HEAD`, falling back to `HEAD~1` if on the default branch itself so `Branch` still degrades gracefully.

- **(5) Unasked question**
  - *When `Working` has zero uncommitted files (e.g. right after clicking `Changes` on a `reviewing` leaf in Tasks whose seat already committed its changes), should `Changes` stay blank on `"No changes"` or help the operator see the leaf's committed diff?*
  - **Answer**: When `Working` is empty on a non-main branch (or when opened from a Tasks leaf button), show a 1-line clickable banner inside the empty state (`"Working tree clean — View branch diff (N files) or last commit"`) that switches to `Branch` or `Recent` in one click.

---

## 3. Files: Markdown rendering (F4), repo-wide filter/search, and "changed recently"

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Markdown rendering (Yes — high value)**: When `this.file` ends with `.md` or `.mdx` (`/home/ivan/.config/herdr-app/mods/files/main.js:120-138,167`), default to `TextView.markdown("files-md", this.text).selectable(true)` (`/home/ivan/.config/herdr-app/AGENTS.md` `### UI`, `/home/ivan/.config/herdr-app/gpui-kit.d.ts:21923`) inside a padded `v_flex().flex_1().overflow_y_scrollbar()`, with a `[Raw]` toggle pill in the file header (`files/main.js:160-163`) that switches back to `Editor.new(this.code)` when raw markdown source is desired.
    2. **Repo-wide file filter/search (Yes — high value)**: Add a compact `Input.new(this.filterInput).small().cleanable(true)` (`placeholder: "Filter files…"`) at the top of the tree view (`files/main.js:164`). When the query is empty, show the existing lazy directory tree (`files/main.js:140-154`). When non-empty, filter a cached flat repo path list loaded via `git --no-optional-locks ls-files -z --cached --others --exclude-standard` (with case-insensitive substring/subsequence matching on relative path, capped at 200 rows) and show each match with its git status badge (`M`/`A`/`U`) and parent directory.
    3. **"Changed recently" (`[Recent]` toggle pill next to the filter input — Yes, git-based, last 30 files)**: Clicking `[Recent]` switches the list from the folder tree to a flat list of the **last 30 existing files** ordered by: (a) currently uncommitted/untracked files from `git status --porcelain=v1 -z` (`files/main.js:76-97`) at the top, followed by (b) unique recently committed file paths from `git --no-optional-locks log -n 30 --name-only --pretty=format: -z` filtered to paths that still exist on disk.
  - **Reason**:
    - Almost all akrogon/chart artifacts (`INTAKE.md`, `MAP.md`, `SPEC.md`, `plan.md`, slot briefs/notes) are `.md` files (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Agent findings` F4), and `TextView.markdown` is already built into Herdr's GPUI kit (`/home/ivan/.config/herdr-app/gpui-kit.d.ts:21923`).
    - Repo-wide `git ls-files` search eliminates 4–5 levels of manual folder clicking (`issues/chart/herdr-panels/slots/...`).
    - **Git status + `git log` beats filesystem `mtime`** because `git checkout`, `git worktree add`, rebase, and build tools rewrite `mtime` across hundreds of files the operator/agents did not actually edit; capping at 30 deduplicated files avoids an arbitrary time cutoff (e.g. "last 1h" being empty after lunch).
  - **Cost**: `~95` LOC added to `/home/ivan/Work/infra/herdr-setup/mods/files/main.js`.

- **(2) Rejected options with reasons**
  - **Filesystem `mtime` walk for "changed recently"**: Rejected; requires walking the entire repo tree (which `files/main.js:35-66` intentionally avoids via lazy expansion) and produces false positives after branch switches or `npm install`.
  - **Filtering only already-expanded folders in `this.entries`**: Rejected; `this.entries` only holds the root directory until the user manually clicks into subfolders (`files/main.js:49-51`), so searching for `INTAKE.md` or `status.ts` would find nothing.
  - **Always rendering `.md` with no `[Raw]` toggle**: Rejected; operators frequently inspect raw markdown line numbers or copy fenced blocks verbatim.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/files/main.js:120-138,167` — `openFile()` always constructs `EditorState.new({ language, readonly: true, ... })` and renders `Editor.new(this.code)`, even when `ext === "md"` (`line 113`).
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/gpui-kit.d.ts:21923` & `/home/ivan/.config/herdr-app/AGENTS.md` (`### UI`) — `TextView.markdown(id, markdown)` is a first-class built-in GPUI component.
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` (`## Agent findings` F4) — identifies raw `.md` source in `files` as hard to read in the narrow dock.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: `git log --name-only` includes files deleted in later commits, which fail if clicked.
  - **Removal**: Cross-check `git log` paths against the cached `git ls-files` Set (`O(1)` lookup) so deleted files are skipped before rendering the 30-item `Recent` list.

- **(5) Unasked question**
  - *When viewing a `.md` file that an agent is actively updating on disk, does `Files` refresh the open file preview automatically?*
  - **Answer**: Today `files/main.js:35-38` only calls `this.load(cx)` (which refreshes directory entries and git marks) on `watchFolder` events, **not** `this.openFile(this.file, cx)`! In the cloned `files` mod, if `this.file` is open when `watchFolder` fires, re-stat `this.file` and re-read it when its `mtime`/`size` changes so live `.md` artifacts (`INTAKE.md`, `MAP.md`) update in place.

---

## 4. Worktree picker and "open as pane" (A3)

- **(1) Pick with reason and cost**
  - **Pick**:
    1. **Worktree picker in the `Files` and `Changes` header (`shared("workspace.worktree")`)**:
       - Store an optional per-space checkout override in `shared("workspace.worktree")` (`{ [spaceId]: { path, branch, main } | null }`). When `null` (the default), `location()` follows the focused terminal pane (`pane?.cwd || f?.cwd || space?.folder`, identical to `/home/ivan/.config/herdr-app/mods/files/main.js:6-11` and `changes/main.js:5-10`).
       - Reuse the exact git discovery from `/home/ivan/.config/herdr-app/mods/worktree/main.js:28-44,99-105` (`git rev-parse --show-toplevel --git-common-dir` to locate `repo.main` even when already inside a linked worktree, then `git -C <repo.main> worktree list --porcelain`). Because `akrogon` creates leaf worktrees (`~/.akrogon/worktrees/<repo>/<slug>`) with `git worktree add`, `git worktree list --porcelain` **automatically discovers every open akrogon leaf worktree, every `~/.herdr/worktrees` checkout, and the main checkout** in one call.
       - Make the right-side folder/branch label in the `Files` and `Changes` header (`files/main.js:163`, `changes/main.js:186`) a clickable pill: shows `Follow (main) ▾` by default, or `wt: <branch/slug> ×` (highlighted) when pinned. Clicking the pill toggles an inline checkout list at the top of the panel; clicking `×` clears the override back to following the focused pane.
    2. **Direct link from Tasks leaf row (`INTAKE.md` `## Round 3` item 2a)**:
       - Clicking the `"Files"` or `"Changes"` button on an expanded leaf row in Tasks (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/slots/tasks-panel-final.md:11`) calls `setShared("workspace.worktree", { ...shared("workspace.worktree"), [spaceId]: { path: leaf.worktree, label: leaf.slug } })` and `run("layout.select", { stack: "panel-body", child: "files" | "changes" })`.
    3. **"Open as pane" (`[↗]` icon button in `Files` and `Changes` header — Yes)**:
       - Add a compact `[↗]` icon button in the `Files` header (when viewing a file, or for the tree) and in the `Changes` header. Clicking `[↗]` calls `run("pane.split", { direction: "right", mod: "files" | "changes", props: { cwd: this.root, file: this.file, scope: this.scope } })` (`/home/ivan/.config/herdr-app/AGENTS.md` `### UI`).
       - In both mods' `location()`, check `this.props?.cwd` first (`this.props?.cwd || sharedOverride || pane?.cwd || f?.cwd || space?.folder`) and initialize `this.file = this.props?.file` / `this.scope = this.props?.scope` in `init(cx)`, so a split pane stays locked to the checkout/file it was opened with and can be dismissed with `Alt+Esc` or `ctrl-b x` (`/home/ivan/Work/infra/herdr-setup/layouts/flat.json:37,51`).
  - **Reason**: Gives two complementary entry points to any worktree—1-click jump from an expanded Tasks leaf row (`Round 3` 2a) **and** direct checkout switching inside `Files`/`Changes` without opening Tasks first—while keeping the default `"Follow focused pane"` behavior untouched. Adding `[↗]` solves the `368px` width limit (F4/F5) on demand for wide diffs and long markdown specs without permanently widening the right dock.
  - **Cost**: `~55` LOC shared helper (or duplicated in both mods) for `repoOf`/`worktree list` + header pill + `pane.split` button.

- **(2) Rejected options with reasons**
  - **Mount the standalone `worktree` mod (`/home/ivan/.config/herdr-app/mods/worktree/main.js`) as a separate panel tab**: Rejected; `worktree/main.js:244-275` is a full-screen worktree creation/deletion manager that opens new terminal panes on click (`line 258`), not a checkout selector for `Files` and `Changes`, and adding a 5th tab violates the 4-button top bar (`/home/ivan/Work/infra/akrogon/issues/chart/herdr-panels/INTAKE.md` `## Round 1`, `## Round 2`).
  - **Rely only on the Tasks leaf buttons with no header indicator/picker in `Files` and `Changes`**: Rejected; if the Tasks `"Files"`/`"Changes"` button overrides the directory without a visible `wt: <slug> ×` badge and reset control in `Files`/`Changes`, the operator cannot tell which worktree they are looking at or return to following the focused terminal pane.

- **(3) Evidence**
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/worktree/main.js:28-44,99-105` — `repoOf()` resolves `repo.main` from `--git-common-dir` and `checkouts()` runs `git -C repo.main worktree list --porcelain`.
  - `[Tier 1 | Code | 2026-11-03]` `/home/ivan/.config/herdr-app/mods/files/main.js:6-11` & `/home/ivan/.config/herdr-app/mods/changes/main.js:5-10` — `location()` currently reads only `pane?.cwd || f?.cwd || space?.folder` and ignores `this.props` and `shared()`.
  - `[Tier 1 | Doc | 2026-11-03]` `/home/ivan/.config/herdr-app/AGENTS.md` (`### UI`) & `/home/ivan/.config/herdr-app/herdr.d.ts:11-28` — documents `run("pane.split", { direction, mod, props: { file } })` and `shared(key)` / `setShared(key, value)` across mods.

- **(4) Pitfalls and what removes each**
  - **Pitfall**: A pinned worktree (`shared("workspace.worktree")?.[spaceId]`) is deleted when a leaf merges (`akrogon merge` removes `~/.akrogon/worktrees/<repo>/<slug>`), leaving `Files` and `Changes` pointed at a non-existent directory.
  - **Removal**: In `sync()`, if the pinned `worktree.path` no longer exists (`!fs.stat(path)`), automatically clear `shared("workspace.worktree")[spaceId]` back to `null` (Follow focused pane).

- **(5) Unasked question**
  - *When the operator switches terminal panes inside the same space after pinning a worktree from Tasks or the header pill, should `Files`/`Changes` stay pinned or auto-reset?*
  - **Answer**: Stay pinned while the `wt: <slug> ×` pill is active (since the operator may scroll or run a command in the terminal while cross-referencing the leaf's worktree), and let clicking `×` (or picking `Follow focused pane`) reset it—plus auto-clear if the space's repo root changes.

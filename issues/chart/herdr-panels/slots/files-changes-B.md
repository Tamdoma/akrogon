# Slot B: Files and Changes

Evidence date: 2026-11-03. Sources below are operator instructions or better-than-training installed code/types. All operation probes remain pending. No layouts, mods or terminal state were changed.

## Q1. Extend existing panels or add more?

**D1. Pick:** extend personal clones of Files and Changes. Keep their buttons, tree/list, preview/diff arrangement, theme and interaction style. Add a compact checkout selector to both headers; add Changes' scope selector; add Files' path filter and Markdown/raw control. Remove Changes' commit footer. No separate Review, History or Markdown panel is needed. Cost: these specific controls change inside two familiar panels, and the clones need upstream comparison after app updates.

This is the narrow distinction to put to the operator: preserving the existing interfaces' organization permits these requested additions, but is not a claim that their contents remain literally unchanged. A1 changes Changes, A2 changes Files, and A3 supplies their shared inspection context.

**Rejected:** new top-level buttons for each capability, which multiply panels doing the same inspection. Editing shipped mods, which startup replaces. Redesigning the existing tree, cards or diff rows as part of these additions.

**Evidence:** operator tier: intake **Agent findings**, A1–A3, and **Round 2** preserves existing interfaces and places additions in the right panel. Installed: `/home/ivan/.config/herdr-app/mods/files/main.js:156`; `mods/changes/main.js:175`. Manual **Layouts: `layouts/<name>.json`** requires cloning shipped code; its clone command rewrites own asset paths. Store the personal clones in herdr-setup and point flat at them. Leave the shipped worktree management mod alone.

**Pitfalls removed:** retain original defaults and read-only preview behavior, with only the listed visible changes. **P1** compares narrow/wide populated screens and existing keyboard behavior. Do not turn this into unrelated cleanup of the clones.

**Additional question:** confirm that the requested controls may be added inside Files/Changes, rather than interpreting “unchanged” as a ban on A1/A2 themselves.

## Q2. Commit and comparison scopes

**D2. Pick:** remove Commit and its message field. Default to Working tree, preserving today's list/diff behavior. One scope selector offers Working tree, Branch changes and Recent commits. The latter shows a bounded commit list; selecting a commit shows its changed files and diffs in the same panel. Cost: commits remain an agent/terminal operation, and history inspection adds one selector.

Working tree includes staged, unstaged and untracked paths, with conflict/binary states explicit. Branch changes compares the merge base of the selected default-branch ref and HEAD against HEAD. It shows committed branch work, not uncommitted edits. Show the resolved base/ref and commit IDs. Use the repository's actual default branch, not literal `main`; a missing or ambiguous local default ref asks for an explicit base instead of guessing or fetching. For a selected merge commit, use a clearly labelled first-parent comparison. A root commit compares against the empty tree.

**Rejected:** keeping `git add -A`, which stages unrelated concurrent edits. Selected-file commit, which adds index ownership, partial staging and concurrent-write questions that this review surface does not need. Silently combining dirty edits with committed branch scope. Fetch/checkout/stage/discard actions on a review click.

**Evidence:** installed: `/home/ivan/.config/herdr-app/mods/changes/main.js:75`, `:79`, `:126`, `:151`, `:157`, `:200`. The existing footer runs add-all then commit. `:14` already defines Git read flags that prevent index/fsmonitor writes. Read-only inspection found Git 2.56.0, support for merge-base comparison, and this repo's default remote ref at `refs/remotes/origin/main`. Earlier B map **D4. A1 git review and mutation** records the endpoint distinction.

**Pitfalls removed:** use the same captured comparison endpoints for the file list and diff, including refresh/rebase. Preserve the existing no-ext-diff/no-textconv flags on new diff paths. **P2** covers dirty/staged/untracked changes, clean committed branches, unborn/detached HEAD, non-main defaults, missing bases, root/merge commits, renames, deleted/binary files and checkout changes during reads. Expose preview truncation explicitly.

**Additional question:** confirm first-parent merge inspection and the recent-commit count. I suggest 20 commits as a bounded starting list, labelled by count rather than “recent” implying a time window.

## Q3. Markdown, path filter and recent files

**D3. Pick:** formatted Markdown by default for Markdown files, with a Raw toggle back to the existing read-only code preview. Add a filename/path filter over the selected checkout's tracked and nonignored untracked paths, using NUL-delimited Git output. It searches unopened folders too. Clearing it returns the existing lazy tree. Label its coverage so ignored files are not implied to be searchable. Ordinary folder browsing remains available outside Git; this repo-path filter is explicitly unavailable there.

Keep a Recent files view based on the selected HEAD's last agreed number of commits, union current uncommitted paths. Distinguish committed versus uncommitted entries. Deleted historical paths show as deleted and lead to an appropriate Changes comparison rather than pretending current file contents exist. Cost: path enumeration and Git-history reads, plus a small Tree/Recent choice. Full-text content search is outside this pick.

**Rejected:** filtering only loaded entries, because it misses unopened directories and the browser has explicit caps. Filesystem mtime as authored recency, because checkout/rebase/install activity changes it. An in-memory recently-seen list, which loses history on restart. Markdown-only preview without source access.

**Evidence:** installed: `/home/ivan/.config/herdr-app/mods/files/main.js:14`, `:53`, `:58`, `:124`, `:132` shows lazy/capped enumeration and raw Editor previews. `/home/ivan/.config/herdr-app/gpui-kit.d.ts:20701` exposes native Markdown, selectable text and link callbacks. The existing bridge limits file reads to 1 MiB (`herdr.d.ts:23`); Files additionally truncates preview text. These limits still apply.

**Pitfalls removed:** relative Markdown links use the captured source file/machine, never later terminal focus. **P3** must establish the native callback's URL resolution before promising local links and anchors. Mark large/binary/unavailable previews and incomplete result limits visibly. Use virtualized bounded rendering without presenting an incomplete list as complete search. Git-read failures remain errors, not “no results.”

**Additional question:** confirm path search rather than file-content search, and whether Recent files should use the same 20-commit window as Changes. The two views serve different actions: opening current files versus reviewing a commit.

## Q4. Worktree selection and open-as-pane

**D4. Pick:** one inspection selection per space, shared by Files and Changes. Its default is Follow focused terminal. Selecting a checkout pins it until Follow is selected again. Both headers show the same repository/branch/path and the same small picker. List actual main/linked checkouts from `git worktree list --porcelain -z`, including detached states, rather than constructing an akrogon/herdr store path. Cost: an explicit pin can intentionally differ from the focused terminal, so its label must stay visible.

Tasks' Files/Changes buttons write that same selection and open the requested panel. Carry machine plus checkout path together. A local Tasks target must not inherit the machine of a remote focused terminal. A Tasks row from another repo can pin that repo's checkout in the current space; the picker then lists that selected repo's checkouts. Follow returns to the terminal's context. Selection itself never switches spaces, checks out branches or creates/removes worktrees.

I would omit Open as pane initially. The right panel already resizes, and the operator's latest placement instruction keeps additions out of the terminal area. If the operator explicitly wants that exception, use an ordinary mod pane with pinned root/file/comparison props. It needs no new layout region, shell or worktree-management workflow. Its cost is occupying terminal space until closed.

**Rejected:** separate per-mod selections, which make Tasks direct Files and Changes at different checkouts. Always following focus after a Tasks click, which immediately undoes the selection. Reusing the shipped Open worktree action, which switches/creates a space rather than merely inspecting a checkout. A pane that follows later terminal focus would lose the file it was opened to inspect.

**Evidence:** operator tier: intake **Round 3**, 2a explicitly points both panels at the leaf worktree; **Round 2**, Q5 preserves the terminal area and locates additions in the right panel. Installed: `/home/ivan/.config/herdr-app/mods/files/main.js:6`, `:49`; `mods/changes/main.js:5`; `mods/worktree/main.js:30`, `:204`; `/home/ivan/.config/herdr-app/herdr.d.ts:385` provides shared selection state. Manual **The model: spaces, tabs, terminals** and **Commands** support `pane.split {direction, mod, props}` if that option is approved.

**Pitfalls removed:** context identity includes space, machine, checkout and comparison generation. Discard older async responses after selection changes. A removed/prunable worktree stays explicitly unavailable until another selection, rather than silently following focus. **P4** covers Tasks selection across repos, two spaces with different pins, rapid focus changes, deleted worktrees and detached HEAD. If pane opening is selected, capture props and prove its null focused cwd cannot erase its source.

**Additional question:** does the operator want the explicit mod-pane exception, or is the resizable right panel sufficient? My pick is the right panel only.

## Required probes and done evidence

- **P1. Existing UI:** show the two cloned mods with all added controls at the current 368px panel width and a wider size. Preserve tree navigation, back, diff selection, theme, keyboard focus and existing Files/Changes buttons. Pass `herdr-app check` and exercise them in-app.
- **P2. Git semantics:** use controlled fixtures for the states listed under Q2. Pass when every scope's list and diff share captured endpoints, default refs are explicit, no action writes Git state and output/preview limits remain visible. No historical comparison may depend on the current dirty file contents.
- **P3. Native Markdown/search:** render a real local document with relative links, anchors, code fences and long text, and test a file found only inside an unopened directory. Pass when links resolve against the document, Raw preserves source, and limits/errors are distinct from empty results.
- **P4. Shared context:** trigger the actual Tasks-to-Files/Changes handoff while focus and async reads change. Pass when both panels retain the intended machine/root, a later response cannot overwrite a new selection, and Follow restores the terminal context. No worktree is created, removed or checked out.

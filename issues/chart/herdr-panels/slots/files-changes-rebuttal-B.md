# Slot B rebuttal

Evidence date: 2026-11-03. Installed code/types are better-than-training evidence; recommendations are inference.

- **F1. Clearing a vanished pin misattributes B.** B retains the selected target as unavailable until the operator chooses another checkout or Follow. Clearing it, even with a notice, can redirect both panels to an unrelated focused checkout. Evidence: B notes **Q4. Worktree selection and open-as-pane**; `/home/ivan/.config/herdr-app/mods/files/main.js:6` shows the ambient focus source that clearing would restore.

- **F2. Being on the default branch does not imply an empty Branch comparison.** Local `main` can contain commits ahead of `origin/main`; merge-base-to-HEAD then has a real diff. Show the actual endpoints/result, with a default-branch label if useful. B did not endorse suppressing that result. Evidence: B notes **Q2. Commit and comparison scopes**; `/home/ivan/.config/herdr-app/mods/changes/main.js:79`, `:126` demonstrates why endpoint choice defines the displayed diff.

- **F3. The shared-context contract lost material fields.** A slug chip alone cannot identify arbitrary checkouts or a Tasks target from another repo/machine. Preserve machine plus root and show repository/branch/path. B also explicitly makes Tasks' Files/Changes buttons open the requested panel, not merely set a pin. Evidence: B notes **Q4. Worktree selection and open-as-pane**; `/home/ivan/.config/herdr-app/mods/files/main.js:6`; `mods/changes/main.js:5` currently derive machine and cwd together.

- **F4. Restore comparison identity and merge semantics.** B requires first-parent inspection for selected merge commits, an empty-tree comparison for root commits, and captured endpoints shared by list and diff. Location-only async guards are insufficient once scope/commit can change without cwd changing. Evidence: B notes **Q2. Commit and comparison scopes**; `/home/ivan/.config/herdr-app/mods/changes/main.js:11`, `:113`, `:131` currently guard by location/path.

- **F5. Recent commits was requested.** Rejecting it as something nobody asked for contradicts intake **Agent findings**, A1: “Working tree | Branch vs main | Recent commits.” Keep B's commit selector inside Changes rather than silently dropping that scope. Tier: operator-provided intake; installed existing list/diff layout at `/home/ivan/.config/herdr-app/mods/changes/main.js:187` can host its results.

- **F6. Repo-wide path filtering should win.** Loaded-folder filtering misses unopened directories and capped entries. It cannot satisfy a repository path search. Preserve NUL-delimited enumeration and visible limits. Evidence: `/home/ivan/.config/herdr-app/mods/files/main.js:14`, `:53`, `:58`; B notes **Q3. Markdown, path filter and recent files**.

- **F7. The picker should work independently of Tasks.** A Tasks-only chip cannot select another checkout for a repo without an akrogon leaf. A3 explicitly requests a worktree picker. Use Git's checkout list, without the shipped worktree action's space-changing behavior. Tier: operator-provided intake **Agent findings**, A3; installed `/home/ivan/.config/herdr-app/mods/worktree/main.js:30`, `:204`.

# Brief 4 repair report (leaf-temp-dir guide hook wording)

## New paragraphs

### docs/guide/merge.md:33
Once the merge seat goes idle or exits after `merged`, the command closes its tab, and a manual repository sweep or startup cleanup closes any tab left behind. The closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep or startup catch-up when the tab already has no live panes; only those sweeps remove completed worktrees and branches, after the issue folder has moved:

### docs/guide/problems.md:53
Hook passes close the tabs of merged leaves, and a tab left behind by an interrupted merge is handled there too. The closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep or startup catch-up when the tab already has no live panes; only sweeps and startup delete a lingering worktree and branch.

### docs/guide/limits.md:10
- **Cleanup is separate from idle events.** A normal hook pass closes the tab of a merged seat; the closed-tab hook deletes the merged leaf's temp folder when its tab closes, with sweep or startup catch-up when the tab already has no live panes; only manual repository sweeps and startup cleanup delete completed worktrees and branches.

## Section 8 report
Changed files and reasons: docs/guide/merge.md, docs/guide/problems.md, docs/guide/limits.md - restate temp-folder deletion as closed-tab hook with sweep/startup catch-up when no live panes, restrict exclusive-sweep claim to worktree/branch removal (F1/D7/C7).
Tests run: AKROGON_BASE changed-test - 346 pass, 0 fail, 13 files, 3013 expects (see brief4-changed-tests.log).
Known limitations: none known.
Unverified criteria: none - criteria 1-3 verified by edited paragraphs, criterion 4 verified by sweep grep in brief4-sweep.log (only corrected temp-folder hits, no confirmed-gone, other hits unrelated).

## Evidence files
- brief4-diff.patch
- brief4-changed-tests.log
- brief4-sweep.log
- brief4-report.md (this file)

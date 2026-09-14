# Report 3: guide line edits

## Changed files and reasons
- docs/guide/phases.html — deleted the "Why a stuck agent's work goes to the other pane" why-box (stand-in machinery gone).
- docs/guide/problems.html — attempts row now reads "Look at the pane. After three tries the leaf fails."; phase:failed row exit is now `akrogon phase <slug> <phase>`.
- docs/guide/next.html — step 5 keeps only the global max_active condition; per-repo clause removed.
- docs/guide/setup.html — deleted the commented `# max_active: 2` per-repo line.
- docs/guide/cheat.html — repo config comment now `# checks, fix_rounds, broadcast`.
- docs/guide/in-practice.html — removed the per-repo max_active sentence; rest of answer kept.
- docs/guide/install.html — why-box keeps global ceiling sentence, per-repo sentence removed.
- docs/guide/limits.html — capacity card keeps machine-wide text, per-repo sentence removed.

Do-not lines verified intact: debate lines (state.html:62,80, create.html:81, files.html:101-102), phases.html failed-row `implement` exit, in-practice.html:86,120, global max_active text (install.html:68, in-practice.html:60,126, cheat.html:83,88, next.html svg label). No src/ or tests/ file touched by this brief (worktree shows other workers' src/tests changes; mine are docs/guide only).

## Tests run
No test command applies to docs. Ran the section 2 greps:
- `grep -rn "stand-in\\|other agent's pane\\|other pane" docs/guide/` → no output, exit 1. Clean.
- `grep -rn "issues/config.yaml" docs/guide/ | grep "max_active"` → no output, exit 1. Clean.
- `grep -n "phase: failed" -A2 docs/guide/problems.html` → row names `akrogon phase <slug> <phase>` as the exit. Pass.
- `grep -rn "max_active" docs/guide/` → only global mentions remain (cheat 83,88; in-practice 60,106-global,126; install 68,80-global; limits 59-global; next 65-global,82 svg). Pass.

## Known limitations
None known.

## Unverified criteria
None.

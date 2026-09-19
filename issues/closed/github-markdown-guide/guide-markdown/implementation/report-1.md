# Report 1: README entrance + 17 guide pages + init contract fix

Changed files and reasons:
- README.md: rewrote top as entrance (reader line, factory sentence, operator owns, stops at merge, reading-order list for 17 pages); fixed init row to optional --from; fixed skill roots to four.
- docs/guide/idea.md, parts.md, state.md, install.md, setup.md, create.md, chart.md, next.md, phases.md, files.md, gacp.md, merge.md, in-practice.md, limits.md, problems.md, learn.md, cheat.md: created all 17 markdown pages in reading order, each ending with Previous/Next/Home line, using widgets/export-csv running example, voice, and src/config/skills truth with 12 drift fixes.
- tests/command-reference.test.ts: updated init contract to [--from <proposal.yaml>] [--toolkit <lang>=<runner>] in same edit as README row.

Tests run:
- bun test tests/command-reference.test.ts: 4 pass, 0 fail, 895 expects.
- AKROGON_BASE=b1bdde3105a673cf57f350b8e3c636ce3b9eee6b bun test --changed=$AKROGON_BASE: 19 changed files, 1 test file run, 4 pass, 0 fail.

Known limitations:
- None known for this unit. Old .html files and style.css intentionally left for later unit per brief. Link test and deletions are later units.

Unverified criteria:
- None. All 8 criteria met: README entrance and rows, 17 pages with nav, truth with corrections list below, voice, reader and akrogon terms, running example widgets/export-csv on every page, gacp subshell with explainer and sync comparison and honest rollback note, init contract with green test.

## Corrections list (old html file:line -> what page now says -> evidence file:line)

1. parts.html:72, idea.html:59, idea.html:82, index.html:57 A is Claude B is Codex two vendors required -> slots are seats with configured harness and model, vendor spread is choice, both seats may be same. Pages: idea.md, parts.md, install.md. Evidence: config.yaml:2-14, src/next.ts:218-225.

2. create.html:67-83, parts.html:84-94 one-level leaf issues/open/rename-flag/state.yaml -> issue folder holding leaf folder, depth 2 or 3, example issues/open/export-csv/export-csv/state.yaml. Pages: parts.md, create.md, idea.md. Evidence: src/state.ts:86-91.

3. parts.html:71, state.html:79 phase is the only signal -> phase is main signal, done prompted panes hand_built blocked-by also steer dispatch. Pages: parts.md, state.md. Evidence: src/next.ts:409-417, src/next.ts:512-542.

4. state.html:83, problems.html:60 attempts count prompts reset on phase change fail at 3 -> attempts count consecutive failed deliveries per seat, reset to 0 on delivered prompt, fail at 3, permission waits do not count. Pages: state.md, limits.md, problems.md. Evidence: src/next.ts:350-391.

5. next.html:61-62, next.html:97 next --all visits every repo -> current repo inside one, every repo outside, plus matching cleanup scope. Pages: next.md, in-practice.md. Evidence: src/next.ts:674-682.

6. limits.html:57, in-practice.html:114 blockers read once never re-read -> blocked-by checked before every dispatch. Pages: next.md, limits.md, state.md. Evidence: src/next.ts:534-542.

7. files.html:63, limits.html:64, cheat.html:67 sync stages everything commits checkout -> sync commits only eligible issue records issues minus seeds locks worktree_root, refuses wrong branch detached HEAD and staged paths outside. Pages: files.md, limits.md, cheat.md, gacp.md, create.md. Evidence: src/sync.ts:11-33, src/sync.ts:109-114.

8. problems.html:59-61, phases.html:66 failed recovery vague send back to implement -> from failed akrogon phase slug phase to any active phase in routing not merged failed, failure record with cause phase slot reason, seat-declared operator-only stops written to review or report then failed with reason. Pages: phases.md, problems.md, in-practice.md. Evidence: src/routing.ts:35-38, src/state.ts:11-19, skills/implement-issue/SKILL.md:31-33, skills/implement-issue/SKILL.md:43, skills/check-issue/SKILL.md:25, skills/merge-issue/SKILL.md:25.

9. in-practice.html:119-120 edit phase by hand to implement then next -> teach akrogon phase, it resets done verdict prompted attempts failure busy and fix_rounds leaving failed. Do not hand-edit phase to move. Pages: in-practice.md, idea.md, state.md, phases.md. Evidence: src/phase.ts:95-112.

10. create.html:60 small item skips chart -> same chart structure straight to handoff when map finds no fog, writes chart folder then hands off. Pages: create.md, chart.md. Evidence: skills/chart-issues/SKILL.md:37.

11a. README.md:14 two skill roots -> four roots claude agents codex pi-agent. Pages: README.md Install prose, install.md. Evidence: src/install.ts:11.

11b. README.md Command init row --from required, tests/command-reference.test.ts:12 -> --from optional, row akrogon init [--from <proposal.yaml>] [--toolkit <lang>=<runner>], contract updated same edit. Pages: README.md, setup.md. Evidence: src/akrogon.ts:32-37, src/init.ts:13-23.

12. gacp semantics -> gacp() subshell body verbatim, stages current subtree git add ., commits whole staged index, requires main, pull rebase autostash, prints conflicts aborts, pushes. Honest note commit exists before failed pull so checkout unchanged is not full rollback. When to use vs sync strict eligible-only. Page: gacp.md. Evidence: brief section 8 script body, src/sync.ts:11-33 for sync contrast.

13. parts.html:77, install.html:63 hook runs next on status or pane exit plus next --all at start -> hook runs next on pane.agent_status_changed pane.exited pane.closed tab.closed, plus pull --all and next --all at startup. Pages: idea.md, parts.md, install.md, next.md. Evidence: plugin/herdr-plugin.toml:6-27.

14. state.html:60 priority, state.html:75 slot -> priority and slot ignored, not in schema, do not add to new leaves, order is blocked-by plus folder scan. Pages: state.md, next.md, limits.md. Evidence: src/state.ts:35-57, src/state.ts:69-77.

15. learn.html:58 lesson deleted when leaf applies it -> lessons pruned at chart open when no longer useful, no auto-delete on apply found. Page: learn.md. Evidence: skills/chart-issues/SKILL.md:27, skills/plan-issue/SKILL.md:25-27, skills/merge-issue/SKILL.md:31.

16. next.html:61-65 cleanup implied always every repo, merged never counts -> cleanup only on hand-typed next next --all startup, never hook, current repo inside outside all, merged and failed never count even with tab open. Pages: next.md, limits.md, phases.md. Evidence: src/next.ts:260-299, src/next.ts:551-557, src/next.ts:621-682.

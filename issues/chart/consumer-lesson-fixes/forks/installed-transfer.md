# installed-transfer

## Question

See the round below and slots/installed-transfer-merged.md.

### Carries

- Signposts: forks/signposts.md ## Taken (1a 2a 3a 4a 5a 6a).
- Opening maps: slots/map-A.md, map-B.md, map-C.md, map-D.md.

## Findings

Merged notes: slots/installed-transfer-merged.md. Rebuttals: slots/installed-transfer-rebuttal-B.md, -C.md, -D.md.

Charting observations (free, read-only, 2026-11-17): `realpath ~/.claude/skills/learn-issues/SKILL.md` resolves under `~/.akrogon/releases/39e203a7.../` (D); framework lines at 5de547004a map to history files (door, git show); six lesson-rule.md copies share md5 69b25f31; no test keeps them identical; docs/use/learn-from-work.md `Transfer` bullet restates the same-repo rule. Final check: slots/final-shape.md, slots/final-check-B.md, -C.md, -D.md.

## Taken

A's pick under full autopilot, 2026-11-17, not operator words: 1a with Q2 to Q6 as below.

- Transfer (lesson-rule.md Transfer in all six copies, learn-issues SKILL.md Sort and Apply, docs/use/learn-from-work.md Transfer bullet) also accepts an installed akrogon step: a plan-issue or check-issue step, or a standing-design line those apply, reached on the leaf path where the lesson's case happened (D Q6, C I1). When that step already states the rule the pass adds nothing at the step, deletes the line and appends `Transferred <YYYY-MM-DD> to <installed akrogon file> § <section> "<line's opening words>" at release <sha>, approved by <who>`, the sha read from the `realpath` of the running installed skill under `~/.akrogon/releases/<sha>/` (C, D). A skill not resolved under `releases/` is the repo's own step and uses today's same-repo Transfer (D). The existing operator approval of the diff completes it; a decline reverts.
- The sorting model judges per lesson, quoting the installed text and why the case is on that step's path; partial coverage keeps the local duty (B, C, D).
- Rewrite, inside the Transfer bullets (C I2, D): a lesson the installed line contradicts or partly covers gets a proposed rewrite of its line in the same uncommitted diff, with `<YYYY-MM-DD>: rewritten against <installed citation>, approved by <who>: <reason>` appended to its history file; a lesson the installed step then fully carries leaves by Transfer. A rewritten line counts as "stay" in the printed footer, footer unchanged. A kept lesson that recommends a script check on model output with no named one-right-answer source is such a contradiction (B narrowed: only checks on model output).
- Unchanged: "a checkable lesson never transfers", the Sort order, Retire.
- Q5 5b: no per-lesson source-naming duty; the report's history-naming clause stays framework work under Tamdoma/tamdoma-framework#650, stated in the done record. Rejected 5a (A, B): a new duty per lesson per pass in every consumer repo (C, D).
- Rejected: 1b new "carried" outcome (new record kind, signposts 5a), 1c Retire exit for model-read lines, removal-only exit for contradicted lessons (D).
- Accepted cost: an orphaned transfer after a later akrogon edit goes undetected (C I2).
- Standing dissent: B would keep 5a.
- Correction after leaf review, 2026-11-17 (A's pick, B, C): the step is classified by where its file resolves, not by install layout: inside the consumer's registered repo it uses today's same-repo Transfer; outside it is an installed akrogon step, cited with the release sha under `<akrogon home>/releases/<sha>/` (`AKROGON_HOME`, else `~/.akrogon`; `src/release.ts` releasesDir, `src/config.ts`), else with that akrogon checkout's git HEAD (`current` may point at `toolRoot`). The five skill-local lesson-rule.md files are tracked symlinks to `skills/lesson-rule.md` (git mode 120000): the leaf edits the one file and keeps the symlinks.

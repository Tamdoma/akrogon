# Design: installed-step-transfer

## Binding decisions, verbatim

### Signposts (issues/chart/consumer-lesson-fixes/forks/signposts.md, Taken, verbatim) (A,B)

Chart: issues/chart/consumer-lesson-fixes (registered akrogon root). Consultants: B pi openai/gpt-6.2-astra high, C pi meta/muse-wonder-full-1.0 high, D claude claude-fable-5-2 medium. Options are listed in that file's ## Question.

A's picks under full autopilot (signposts: A), 2026-11-17, not operator words. The operator's words that handed the round to A, verbatim: "Full autopilot mode, even the signposts."

- 1a. Decided by the operator's "consolidate them" and by speed: one map, one consultant set, three issues that close independently. Rejected 1b (three handovers and restarts for no dependency), 1c (D M1 shows the other two do not depend on #143's wording once today's Retire is the bar; C's shared-file point orders nothing under the split rule).
- 2a. Decided by removing over adding and systems thinking. Rejected 2b (the lesson rule keeps prose-fixed lessons active forever, which is the #143 loop), 2c (two mechanisms for one failure).
- 3a. Decided by simplicity and price: a per-harness hook needs a paid launch per harness to prove (D M3).
- 4a. Decided by function over form: a fix that passes its own tests while the cited lessons stay stuck did not deliver the report's outcome (C M3). Reading is free. Rejected 4b (other repo's records), 4c.
- 5a. Carried from model-judgment's hard limits; removing over adding.
- 6a. Decided by price and the evidence: #142 already changed shape on inspection (C M1). Rejected 6b: no report needs a model run.

Ranked priorities: (1) each fix stops its failure where it happens, in every harness; (2) each change stays small and in existing files; (3) each completion says honestly which framework lessons can now leave.

Hard limits: akrogon repo only; no paid launches; no new script, registry, record kind or scanner for #143; never a second parser beside git's.

Account: the session fixes the three failures at their source in akrogon, checks each report reproduces before fixing it, and reports what the framework can now retire. It gives up framework-side edits and any harness-specific guard.

Chart order: consumer-lesson-fixes only (one chart). A dropped nothing.

### installed-transfer (issues/chart/consumer-lesson-fixes/forks/installed-transfer.md, Taken)

A's pick under full autopilot, 2026-11-17, not operator words: 1a with Q2 to Q6 as below.

- Transfer (lesson-rule.md Transfer in all six copies, learn-issues SKILL.md Sort and Apply, docs/use/learn-from-work.md Transfer bullet) also accepts an installed akrogon step: a plan-issue or check-issue step, or a standing-design line those apply, reached on the leaf path where the lesson's case happened (D Q6, C I1). When that step already states the rule the pass adds nothing at the step, deletes the line and appends `Transferred <YYYY-MM-DD> to <installed akrogon file> § <section> "<line's opening words>" at release <sha>, approved by <who>`, the sha read from the `realpath` of the running installed skill under `~/.akrogon/releases/<sha>/` (C, D). A skill not resolved under `releases/` is the repo's own step and uses today's same-repo Transfer (D). The existing operator approval of the diff completes it; a decline reverts.
- The sorting model judges per lesson, quoting the installed text and why the case is on that step's path; partial coverage keeps the local duty (B, C, D).
- Rewrite, inside the Transfer bullets (C I2, D): a lesson the installed line contradicts or partly covers gets a proposed rewrite of its line in the same uncommitted diff, with `<YYYY-MM-DD>: rewritten against <installed citation>, approved by <who>: <reason>` appended to its history file; a lesson the installed step then fully carries leaves by Transfer. A rewritten line counts as "stay" in the printed footer, footer unchanged. A kept lesson that recommends a script check on model output with no named one-right-answer source is such a contradiction (B narrowed: only checks on model output).
- Unchanged: "a checkable lesson never transfers", the Sort order, Retire.
- Q5 5b: no per-lesson source-naming duty; the report's history-naming clause stays framework work under Tamdoma/tamdoma-framework#650, stated in the done record. Rejected 5a (A, B): a new duty per lesson per pass in every consumer repo (C, D).
- Rejected: 1b new "carried" outcome (new record kind, signposts 5a), 1c Retire exit for model-read lines, removal-only exit for contradicted lessons (D).
- Accepted cost: an orphaned transfer after a later akrogon edit goes undetected (C I2).
- Standing dissent: B would keep 5a.

Excluded here: #141 and #142 decisions (their own leaves); framework LESSONS.md and history edits (signposts 4a).

/home/ivan/.akrogon/releases/39e203a79c5c4ebeef51d1e76a3d8ea43389debc/skills/chart-issues/assets/standing-design.md

Interpretation: the change is rule text read by models, so no test, case or wording assertion is added; whether each framework lesson transfers is the sorting model's choice, and criterion 1 is the reviewing seat's reading of the new text against the named cases (standing-design model-choice line). Criterion 2's symlink mode check and criterion 3's link check are the only mechanical checks, each with one right answer.

Correction after leaf review, 2026-11-17 (A's pick, B,C): the step is classified by where its file resolves, not by install layout. `src/release.ts` keeps releases under `globalHome()/releases` and may point `current` at an akrogon checkout (`toolRoot`); `src/config.ts` honours `AKROGON_HOME`. Inside the consumer's registered repo: same-repo Transfer. Outside: installed akrogon step, cited with the release sha under `<akrogon home>/releases/<sha>/`, else that checkout's git HEAD. The six "copies" are one file plus five tracked symlinks.

## Leaf architecture

- Owned surfaces: the Transfer clause of `skills/lesson-rule.md`, which the five skill-local symlinks point at (B); learn-issues SKILL.md `## Sort` Transfer bullet and `## Apply` Transfer bullet (the add-at-step instruction is skipped for an installed step, and the history line uses the installed citation instead of `<file:line>`); docs/use/learn-from-work.md Transfer bullet.
- Consumers: every seat that writes a lesson reads its skill's lesson-rule.md copy; `/learn-issues` reads SKILL.md Sort and Apply; check-issue SKILL.md accepts a LESSONS.md removal only under a Retire exit, which this change does not alter (a Transfer is done by `/learn-issues`, never a leaf).
- Printed footer in learn-issues SKILL.md: unchanged text; a rewritten line counts in `<n> stay`.
- Open for the plan: the exact sentences, kept short, in each owned section.

# Territory map, merged (2026-11-10)

Merged by A from slots/map-A.md and slots/map-B.md, written blind to each other. Tags name the slots that hold a point. "checked" means the named slot ran the command or read the lines on 2026-11-10. Local main a33d967b; skills, src/next.ts, src/seat.ts and src/install.ts are unchanged from the installed release 63526537 (A,B checked). Ranking follows signpost 1a: fewer parts, then the operator's time, then clock time, then tokens.

## How a seat gets its skill text

- (A,B) src/next.ts `promptFor` sends `<skill> <slug> slot=… phase=… leaf=…`. The command sends a name, never the text. The harness finds and loads the skill.
- (A,B) src/install.ts `planSkillLinks` links each skill directory into four roots: `.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills`. A file beside the skill directories is not linked itself, but `<root>/plan-issue/../lesson-rule.md` resolves on all four roots (4 of 4), because the path goes through the link into the release tree. (B) the normalized path `<root>/lesson-rule.md` does not exist (0 of 4), so a reader must not shorten the path.
- (A,B) Outside sources agree on loading: the harness shows name and description first and loads the whole SKILL.md when the skill is used; further files load only when read. (B) S2 Anthropic skill best practices and Claude Code skills docs, S3 OpenAI "Build skills", S4 pi docs/skills.md v0.82.0 (also A's reader). So a heading inside one large SKILL.md does not make the first load smaller on claude; a separate file does. (A's reader, Anthropic best practices) keep SKILL.md under 500 lines and references one level deep, because nested references get partly read.
- (B) agy: the installer links none of agy's documented skill roots, and `~/.gemini/skills` holds no lifecycle skill. Whether agy finds the skills at all is not shown. (A) no akrogon slot runs agy today: slot A is pi, slot B is codex (`akrogon config`), and the 156 delivered prompts since 2026-11-01 are pi, codex or claude sessions, 18 unrecorded (A checked; the non-path values are codex session ids). So this is an existing gap outside this chart's destination.
- (A) Commit 6490a86c (2026-10-14) wrote the opening sentence "at every phase prompt, re-read this file, its references …" into the lifecycle skills, with the reason "Seats kept acting on rules edited after their first read." The door keeps the opposite rule (read once, re-read after compaction). (A,B) both stay; W5 is not a freshness question.

## Rules stated more than once

- (A,B) Grant paragraph: four copies in Shared context, 1,074 words (238, 237, 311, 288). The core is the same; the subject and the record differ on purpose (plan.md, implementation/report.md, review-<slot>.md, review-B.md).
- (A,B) `.env` paragraph: four copies, 281 words. merge alone lets configured merge checks read `.env.example`, on purpose. (B) that exception must not spread to the other seats.
- (A,B) Producer key save: plan and implement only (64 and 59 words).
- (A,B) Command output through `akrogon run-check`: implement, check, merge in Shared context; plan's shorter copy sits inside plan.synthesis and lacks "at most a short excerpt". (B) more copies live in brief-template.md section 8 and worker-protocol.md, because a worker only sees its brief.
- (A,B) Temp files: three identical copies (84 words); plan has none.
- (A,B) Four grounding lines: identical in all four (64 words).
- (A,B) Pass-artifact location and "the command owns state": same principle, local additions.
- (A,B) No questions and the operator-blocker stop: four wordings of one rule. (B) check-issue's staged "Operator actions" rule is different on purpose and one generic stop cannot replace it.
- (A,B) Fixture cleanup and absence read: in check and merge, appended to the grant paragraph; not in plan or implement. Setup flock: implement ("Effective settings") and check (inside the grant paragraph); not in plan or merge. (A) reads these as drift and leans to giving the rule to every seat. (B) reads them as distribution differences: chart Take and the leaf's readiness contract already require cleanup, and extraction must not widen or narrow any seat silently.
- (A,B) Retry and known-red judgment: implement Shared context, check.review, merge Shared endings, about 430 words each, plus a fourth copy in chart-issues Direct route. (A) the largest copy, and the last three skill commits edited it. (B) same causal test but different runners, states and records, so it stays local until a separate measured consolidation is approved.
- (A,B) Stop by run id and abandoned-capture recovery: the same paragraph twice in implement and twice in check. `merge_checks` only at merge: three times in implement, twice in check.
- (A,B) Test-Change trailer and the test-writing bar: several copies with phase-specific privileges; also in standing-design.md.
- (A,B) Lessons: every write site points at lesson-rule.md. The working precedent for a shared file.
- (B) check-issue/ponytail.md is a symlink to implement-issue's, not a second copy. (A) corrects its map: A's "two identical files" was that link.
- (B) standing-design.md still ends "The operator explicitly accepts that agents can read it" about `.env`, while the seat skills and skills/AREA.md forbid opening it. A discrepancy to show the operator, not to settle by extraction.
- (A) Pointers already work across files: "the `plan-issue` `plan.synthesis` proof-command rule", "the operator-only rule in check-issue Shared context", "the merge-issue solo rule", "standing-design's recorded-output rule", "seed-issue's `## Lifecycle filing` section".
- (A) The opening re-read sentence cannot move: it is what makes a seat read anything else.

## Today's cost (signpost 3a)

- (A) `git log --since=2026-09-01` over the four lifecycle SKILL.md: 143 commits; 65 touched two or more of the four, 32 three or more, 12 all four. Since 2026-10-25: 8 commits, 5 touched two or more.
- (A,B) Words: plan 1,938, implement 4,948, check 4,373, merge 3,052, chart-issues 8,387.
- (A,B) Delivered prompts 2026-11-01 to 2026-11-09: plan.synthesis 24, implement 36, check.review 52, check.repair 17, check.fix 12, merge 2 (143; 156 with the 13 merged prompts). (B) whole-skill exposure 591,857 words, an estimate, not a measured read or bill.
- (A) Text a phase does not need: about 1,170 of 4,948 words in implement, about 1,080 of 4,373 in check.review, about 500 of 3,052 in merge, 0 in plan; about 1,300 tokens per prompt against a first implement call that already carries about 100k tokens at the median (factory-wins W11). (B) the naive saving for check.repair (2,247 words) is invalid until shared definitions move.
- (A,B) chart-issues: Direct route, Autopilot and Handover are 3,761 of 8,387 words (44.8%). (B) not all of it can go: selectors and cross-mode rules must stay.
- (B) W5: one confirmed unneeded read of worker-protocol.md (1,104 words) in watcher-on-hc on 2026-11-08. (B) no number exists for token or clock savings; timing rows do not record bytes read.

## Rules a phase needs from another section

- (A,B) check.fix needs implement's three test exceptions, the rerun rule and the trailer rule. check.repair needs check.review's Fix/Nit bar and retry paragraph. merge "attempt top" needs the solo form's trailer and conflict rules. Standalone review and the direct form import from check.review and Standalone.
- (B) plan.synthesis needs implement's retry rule and its test-writing paragraph ("bind the planner"). implement needs check.fix's plan-correction rule and merge's solo conflict rule.
- (B) R6: worker-protocol.md opens "A leaf delegated implement run exists only when at least one wave holds two or more units", while delegated repairs after a serial-solo implement still need it. The W5 wording must not cancel that read.
- (A,B) chart-issues: Handoff needs the direct-route refusal list; the three-mode definition sits in Autopilot; every section has inline "under autopilot" clauses; Handover is a step at every chart switch, also in manual mode, and a fresh A must see the continuation check before any chart work.

## Tests that pin skill text (tests/docs-links.test.ts)

- (A,B) The link test covers only `skills/<name>/SKILL.md`, not support files or a skills-root file. "lesson write sites link the shared lesson rule" is the existing fixed-reference guard. (A) "seat skills name the known-red command" pins the literal in implement, check and merge; two more tests pin literals in chart-issues/SKILL.md. Moving that text changes those tests.

## Forks and where the slots stand

1. How wide is the one source?
   - (B) narrow: the four named families (grant, `.env` with producer save, command output, re-read) with their bindings; every local exception kept; no behavior change. Reason: "no rule lost" is easiest to review when nothing changes meaning.
   - (A) wide: the same plus temp files, grounding lines, artifact location, the blocker stop, capture recovery and the retry and known-red judgment. Reason: the known-red text is the largest and most edited copy. Cost: pinned tests change, the door's fourth copy must be decided, different runners per phase.
   - Not picked by either: harmonize the differing behaviors first, then extract.
2. Where does the source live? (A,B) one ordinary Markdown file reached like lesson-rule.md, each skill keeping a short local line for its record and slot. No generator, no command-side injection.
3. The gaps (fixture cleanup, setup flock, temp rule, producer save): (A) decide each at extraction, leaning to give the rule to every seat; (B) preserve today's distribution and ask the operator separately for any change of behavior.
4. How is a read made smaller?
   - (B) small entry files for the multi-phase skills (implement, check, chart-issues) with phase and mode files; plan and merge stay whole; cross-phase definitions move to a shared local file.
   - (A) lifecycle: no file split; the gain is about 1,300 tokens per prompt and a split adds files, against signpost 1a; remove the in-file repeats. Door: split, because 44.8% of the text is mode detail and the door loads on claude, where only a file split scopes the load.
   - Not picked by either: a named-section reading rule in the large files; text assembled by the command.
5. W5: (A,B) settled by the transfer. The opening sentence re-reads the references the current step uses; a conditional reference is read when its condition holds, delegated repair included.
6. Proof of "no rule lost": (A,B) an old-location to new-home ledger in the implementation report, followed by the reviewer along each phase's read path, plus file and link checks through an installed release tree; no wording snapshots. A paid before/after run (needs row N1, cap pending) only if the operator wants a token or behavior claim. (B) names fifteen read paths to audit, a fresh repair-only seat among them.

## Split

- (B) L1 shared policy (with W5); L2 lifecycle phase reads, after L1; L3 door mode reads, parallel with L2.
- (A) one leaf for the shared source (with W5) and one for the door files, parallel; a lifecycle phase split only if the operator picks it, after the first leaf.
- (A,B) Direct route refused: more than one outcome. No leaf touches `issues/`.

## Pitfalls with the step that removes each

- (A,B) A seat skips the pointer: the opening sentence orders references read; each Shared context names the file; the link check fails on a dead path.
- (A,B) Extraction erases a real difference: the ledger lists every kept exception beside its skill; review's "launches no covered operation" and merge's `.env.example` stay local.
- (B) A repair starts in a fresh seat that never ran implement or review: audit that entry directly.
- (A,B) Skill and shared file from different releases: both sit in one release tree.
- (A,B) A door change reaches doors only at the next release link.
- (A) Copies regrow at the next rule edit: no mechanical guard without a wording test; the review's job. A cost of every option.
- (A) docs pages name the same rules; a moved rule needs its doc pointer checked.

## Out

Question-round rules (W9), prose caps, post-compaction partial re-reads, new install roots for agy, a paid call before a cap, unrelated doc cleanup.

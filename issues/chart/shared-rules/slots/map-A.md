# Territory map, slot A (2026-11-10)

Written blind to slot B. "checked" means A ran the command or read the lines on 2026-11-10 at local main a33d967b (skills identical to installed release 63526537: `git diff --stat 63526537 HEAD -- skills` is empty).

## How a seat gets its skill text (checked)

- src/next.ts `promptFor`: the phase prompt is `<skill> <slug> slot=<A|B> phase=<phase> leaf=<folder>`, a bare skill name. The harness, not the command, turns the name into text.
- src/install.ts `planSkillLinks`: each skill directory is linked whole into `.claude/skills`, `.agents/skills`, `.codex/skills`, `.pi/agent/skills`. Only directories are linked.
- A file at the skills root is still reachable through every root: `<root>/plan-issue/../lesson-rule.md` resolves to the release's `skills/lesson-rule.md`, readable, 391 words, on all four roots. Four skills already link it this way.
- Every lifecycle SKILL.md opens with the same sentence: re-read this file, its references, brief.md and design.md from disk at every phase prompt. Commit 6490a86c (2026-10-14) wrote it into five skills, with the reason "Seats kept acting on rules edited after their first read." The door has the opposite rule: read once, re-read after compaction.
- Delivered prompts since 2026-11-01 (issues/timings.jsonl, 156): plan.synthesis 24, implement 36, check.review 52, check.repair 17, check.fix 12, merge 2, merged 13. By session path: pi 54, codex 24, claude 19, the rest unrecorded or another path.

## Contract walk: rules stated more than once

Words per file: plan 1,938, implement 4,948, check 4,373, merge 3,052 (14,311).

| Family | plan | implement | check | merge | Same meaning? | Differs on purpose | Drift or unexplained |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Re-read opening line | yes | yes | yes | yes | yes | implement adds the standalone sentence | implement Shared context makes brief-template.md and worker-protocol.md conditional (W5) |
| Four grounding lines | yes | yes | yes | yes | identical | none | none |
| Pass-artifact location | yes | yes | yes | yes | yes | implement adds worker worktrees and standalone | none |
| Temp files and logs | no | yes | yes | yes | identical in three | none seen | plan runs tests but has no temp rule |
| Command output (run-check) | short form inside plan.synthesis | yes | yes | yes | yes | implement adds standalone | plan's copy lives in a phase section and drops "short excerpt" and the exemption reasons |
| No questions, operator-blocker stop | yes | yes | yes | yes | yes, four wordings | artifact name and slot flag | field lists worded differently |
| `.env` | yes | yes | yes | yes | yes, two wordings | merge may read `.env.example` | none |
| Producer key save | yes | yes | no | no | near identical | unknown | absent in check and merge with no stated reason |
| Grant reuse and count lines | yes | yes | yes | yes | core identical but subject and artifact name | artifact: plan.md, implementation/report.md, review-<slot>.md, review-B.md | see next two rows |
| Setup flock | no | in "Effective settings" | inside the grant paragraph | no | yes | unknown | lives in a different paragraph in each; absent in plan, which runs tests |
| Fixture cleanup and absence read | no | no | yes | yes | identical in two | unknown | absent in implement, the phase that runs the live proofs |
| Retry, known-red judgment, base-red filing | by pointer to implement | Shared context | check.review | Shared endings | yes, about 430 words each | actor, artifact, command form (`--attempt`) | a fourth copy sits in chart-issues Direct route step 5.iii |
| Stop by run id, abandoned capture recovery | no | implement and again in check.fix | check.review and again in check.repair | no | identical | artifact name | same paragraph twice inside one file |
| `merge_checks` only at merge, reproducing command | once | three times | twice | once | yes | none | repeated inside one file |
| Test-Change trailer | yes | yes | yes | yes | yes | which commits | none seen |
| Test-writing bar | by pointer | yes | yes | part | yes | reviewer versus writer | also in standing-design.md |
| Lesson write | pointer | pointer | pointer | n/a | pointer to lesson-rule.md | which action | none (the working precedent) |
| ponytail.md | n/a | file | file | n/a | two identical files, 439 words each | none | a duplicated file |

Two patterns already coexist. Copies: the rows above. Pointers: lesson-rule.md, "the `plan-issue` `plan.synthesis` proof-command rule", "the operator-only rule in check-issue Shared context", "the merge-issue solo rule", "standing-design's recorded-output rule", "seed-issue's `## Lifecycle filing` section". The seats already follow cross-file pointers today.

What cannot move: the opening re-read sentence. It is what makes a seat read anything else, so each SKILL.md keeps its own.

## Today's cost (signpost 3a)

- Edits in step: `git log --since=2026-09-01` over the four files: 143 commits; 65 touched two or more of the four, 32 touched three or more, 12 touched all four. Since 2026-10-25: 8 commits, 5 touched two or more. Each multi-file commit is one rule edited in several copies.
- Drift already present: the three unexplained gaps in the table (fixture cleanup missing in implement, temp rule and setup flock missing in plan, producer save missing in check and merge). None is tied to a recorded failure by A.
- Reading: per phase prompt the text the phase does not need is about 1,170 of 4,948 words in implement (check.fix and standalone), about 1,080 of 4,373 in check.review (check.repair and standalone), about 500 of 3,052 in merge (the other rebase form), 0 in plan. chart-issues: Direct route 1,263, Autopilot 1,726, Handover 765, together 3,754 of 8,366 words.
- Scale of the reading cost: about 1,000 words is roughly 1,300 tokens per lifecycle prompt, against a first implement call that already carries about 100k tokens at the median (factory-wins map, W11). An estimate, not observed tokens.

## Rules a phase needs that live in another section

- check.fix needs three things from the implement section: the test-writing exceptions ("the exceptions above"), the implement-end rerun rule, the Test-Change trailer rule.
- check.repair needs the retry paragraph and the Fix/Nit bar from check.review, named by its opening words.
- merge "attempt top" needs the solo form's trailer rule and conflict rule ("as the solo form fixes it").
- Standalone review and the direct form lean on check.review and Standalone.
- chart-issues: Handoff must know the direct-route refusal list (in Direct route); every section carries inline "under autopilot" clauses; the three-mode definition that decides whether autopilot is on sits in Autopilot; Handover is needed in attended mode at every chart switch, so it is a step, not a mode.

## Tests that pin skill text (checked, tests/docs-links.test.ts)

- "README, docs and skill links resolve": covers `skills/<name>/SKILL.md` only, not a root file or an assets file.
- "lesson write sites link the shared lesson rule": the existing guard for a shared file, by a fixed reference.
- "seat skills name the known-red command": requires the literal command in implement, check and merge SKILL.md.
- "chart-issues direct landing names the known-red command" and "names akrogon pack at every end-marker site": require literals in chart-issues/SKILL.md.
- So moving the known-red text or the Direct route out of those files changes existing tests.

## Material forks

1. Which rule families move to the one source? (a) the families identical in meaning in all seats: grounding lines, pass-artifact location, temp files, command output, operator-blocker stop, `.env`, producer save, grant and count lines, fixture cleanup, setup flock, stop by run id and capture recovery; (b) those plus the retry and known-red judgment; (c) only the four the intake names. A leans (b): the known-red text is the largest copy and the last three skill commits (68c3d11e, 16194019, 63526537) edited it. Cost of (b): the pinned tests change and the door's fourth copy must be decided.
2. Where does the one source live, and how does a phase bind its own artifact name? (a) one file at the skills root, linked like lesson-rule.md, each skill keeping one line that names its artifact and slot; (b) inside one skill, the others pointing at it; (c) printed into the prompt by the command. A leans (a): proven reachable on all four roots, no code.
3. What happens to the three unexplained gaps when copies become one text? Stating a rule once applies it to all four seats. For each gap the operator says whether the missing seat gets the rule (A's lean: yes for fixture cleanup, temp and setup flock) or the difference is kept as a stated exception.
4. Is step-scoped reading built, and how? Lifecycle: (a) not as a file split: after fork 1 the unneeded text per prompt is about 1,000 words, and a split adds files; remove the in-file repeats instead; (b) one file per phase; (c) a named-section reading rule like the consultants'. Door: (d) move Direct route, Autopilot and Handover into asset files read when their step arrives, keeping the mode definitions and the refusal list in SKILL.md; (e) leave the door whole. The door runs on claude, whose skill load injects the whole SKILL.md, so only a file split scopes it. A leans (a) and (d).
5. How is W5 worded? The opening sentence re-reads "this file and the references the current step uses"; a reference named with a condition is read when the condition holds. Delegation-point read kept, repairs that delegate included.
6. How is "no rule lost" shown? (a) a clause ledger in the report mapping every clause of the old copies to its new home, judged by the reviewer, plus the existing link test extended to the shared file as a fixed reference; (b) also one paid seat run (needs row N1). A leans (a): a paid run shows one seat on one day, the ledger covers every clause.

## Practitioner questions and pitfalls

- A seat skips the pointer and loses a rule that used to be inline. Removed by: the opening sentence already orders references re-read; the shared file is named in each Shared context; the link test fails on a dead path.
- The shared text needs a parameter (artifact name). Removed by: one local line per skill; the shared text says "its pass artifact".
- An over-broad extraction erases a real difference (merge's `.env.example`, check.review launching no covered operation). Removed by: the ledger lists every kept exception next to its skill.
- The next rule change lands in one skill again and the copies regrow. Removed by: nothing mechanical without a wording test, which the factory rejects; it is the review's job. Cost of every option.
- A release link changes mid-session: the shared file and the skill must come from the same release. Both sit in the same release tree, so they change together.
- A door change reaches doors only at the next release link.
- docs/ pages name the same rules (docs/reference/checks.md, files.md, commands.md, when-work-fails.md); a moved rule needs its doc pointer checked (lesson 2026-09-11).

## Proposed split

- Leaf `lifecycle-rules-source`: forks 1, 2, 3, 5, 6. One file, four skills edited, tests and docs pointers. No dependency.
- Leaf `door-step-files`: fork 4 door part. Independent of the first leaf (different files), parallel.
- A lifecycle per-phase split, if chosen, depends on the first leaf because it moves the same text.
- Direct route refused: more than one outcome.

## Observations needed before handoff

- Shared root file reachable through each harness root: done above.
- That a seat on each harness in use reads a linked reference at a phase prompt: session-level only so far (28 sessions still on disk all contain the reference names, which the SKILL.md text itself supplies), so not yet shown. Needs a tool-call level read of recorded transcripts.
- Outside sources on skill loading and single sourcing: reader running.

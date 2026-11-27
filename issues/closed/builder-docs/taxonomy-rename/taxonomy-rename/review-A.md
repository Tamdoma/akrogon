# Review A — taxonomy-rename, initial round

- Base reviewed: `562611bd309252ddcbe7a18a04a88629d0e82c0e`
- Head reviewed: `c757e91a` (full `c757e91a6773a1cebc3ac408aeca00ffb455255d`, branch tip, working tree clean)
- Blind review: no contact with B, peer review unread.
- Paid sessions: none recorded in implement, none launched in review — matches the leaf's zero budget. `check.review` launched no covered operation.

## Verification evidence read

- `akrogon verify --sha HEAD` green receipt on `c757e91a` — `verify setup/format/typecheck/test: 0`, final line `verify leaf c757e91a…: green` (implementation/check-test-1795775367013-1311902.log and siblings). This covers the full configured `test` command including docs-links, chart-shapes and watch-timer pinned literals.
- Hit scans re-run by me on the reviewed head:
  - `check review-area-paths2: 0 …/implementation/check-review-area-paths2-1795775657339-2017219.log` — every path `skills/AREA.md` names exists in context (`scripts/*` entries resolve inside `skills/chart-issues/scripts/` and `skills/watch-issues/scripts/` as the file intends; my first naive repo-root listing is superseded, `check review-area-paths: 2` was a quoting error in my scan command, not evidence about the leaf).
  - Fresh grep inventory I ran directly on the head (python word-scan): every surviving bare `autopilot` in the seven skill files is a file name, the `## Autopilot` key, `signposts: A`, or a family use; none names the middle mode. In docs, every surviving bare `autopilot` is a file name/link target or the `## Autopilot` key; the only pixel-text remnant is inside `docs/pictures/ways-to-run.svg` (out of scope per the plan's recorded limitation).
  - `Old record words:` line count repo-wide: exactly 1, SKILL.md:128.

## Diff reading (end to end)

I read the full diff `git diff 562611bd...HEAD` for all 19 files. Findings against the criteria:

**Criterion 1 (names and bans):** Confirmed. `Charting mode` and `Build route` are named in SKILL.md and skills/AREA.md with the exact values. Outside the compat line, no line uses `manual`/`attended` as a mode name — the only hits in the seven files are inside SKILL.md:128 itself, which quotes the old words as its function. `autopilot signposts` survives only inside that same line. No bare `autopilot` names the middle mode anywhere in the diff or the resulting text (see Nit N1 for a coverage gap in the family definition, which is not a middle-mode use).

**Criterion 2 (templates and compat line):** Confirmed. Templates write lower-case values: `continue <mode value>` (shapes.md:54), `continue semi-autopilot (handover <time>)` / `continue no autopilot (handover <time>)` (shapes.md:57–58), `no autopilot next <chart>` (handover.md:5, shapes.md:56), resume entry `<mode value>` with a semi-autopilot example (autopilot.md:23). The compat line maps all six old words the brief lists. Exactly one such line exists. Mode-record values written from now on are lower-cased mode names, consistent with historical charts (`on full autopilot` already in use).

**Criterion 3 (behavior):** Confirmed. I compared each changed rule line against its base text:
- Direct-route refusal (SKILL.md:113): old bullet excluded the two non-default modes; new bullet spells them. Bit-identical rule.
- questions.md:41 signposts handling: the three-way split (re-ask / record-unanswered / A-answers) and the conflict-wait mapping are preserved exactly under the new names.
- SKILL.md `## Handover` resume semantics: same entries, new words; `<mode value>` precision improves the old `continue autopilot` which could not distinguish Semi from Full in a compaction-resume, without changing any case's outcome.
- shapes.md:418 dropped `attended` before "handoff review": the word added no rule (the operator attending is the default), and the autopilot exception is covered by the sentence's own parenthetical. Same behavior.
- A's repair commit `c757e91a` restored the two scope narrowings correctly — I verified shapes.md:88 now reads "under Semi-autopilot or Full autopilot, the named chart under No autopilot" and docs/use/autopilot.md:25 now covers both non-default modes for the presented-round rule. Both repairs match the base rule's scope exactly.
- Keys and counts confirmed present and unchanged: `Route:` (2), `## Mode record` (2), `## Autopilot` (9), `signposts:` (3), `akrogon direct` (4) in the primary skill files; `Route:` values remain `<lifecycle | direct>` lower case. File names untouched on disk. `standing-design.md` byte-identical, and its family use is covered by the new definition sentence.

**Criterion 4 (docs, scope, checks):** Confirmed. Diff scope is exactly the 19 owned files, nothing outside `skills/` + `docs/`. Non-mode adjectives survive byte-identical: `a manual step` (autopilot-story.md:18), `A manual akrogon next` (limits.md:15), `unattended` untouched everywhere. docs/use/autopilot.md H1 rename has no inbound hash links (docs-links green confirms). Alt texts updated while SVG pixels stay old — the recorded open limitation, whose replacement is owned by charting-pictures/guide-pictures. The rewritten autopilot.md opener follows plan D5's explicit instruction (page covers all three values). The docs use/quick-fix.md edits are mode-word substitutions only, consistent with the brief's "at least these pages" list and D9.

**Docs changed-behavior pages:** opened docs/use/quick-fix.md and docs/use/autopilot.md for the direct-route and mode behavior; both state the same rules as the skill text — no wrong claims, no dead pointers. No documented behavior changed.

## Nits (deferred, none blocking)

- **N1 — the family definition covers only the literal phrase "under autopilot".** SKILL.md:127 defines `In this file and its assets, "under autopilot" covers Semi-autopilot and Full autopilot together`, but several surviving bare-noun uses are not that phrase: "an autopilot session" (questions.md:39), "an earlier autopilot pick" (SKILL.md:69), "autopilot's handling of findings and readings" (SKILL.md:69), "the same autopilot run" (autopilot.md:13), "the autopilot resume entry" (SKILL.md:140), "autopilot rounds" (questions.md:37). Concern: none of these names the middle mode, but formally they are undefined terms, and the opener "Autopilot is a non-default mode the operator switches on" (SKILL.md:127) still reads as if autopilot were one mode — the sentence sits directly above the definition but outside its coverage. Deferred because: the sentences that use these forms are all adjacent to or inside `## Autopilot`/autopilot.md, every reading an agent can reach is the family (never the middle mode, which no longer exists as a concept anywhere in the text), the pre-rename text had the identical looseness, and criterion 1 bans only middle-value uses — which do not occur. Promotion evidence: a door transcript where A misreads one of these lines as mode-specific, or a definition that a reviewer shows produces contradictory obligations.
- **N2 — report base-column arithmetic understates two counts.** The report's criterion-1 table records base `manual` mode-sense as 2 and `attended` as 7, while the raw base scan it cites counts all word-boundary hits: `manual` 4, `attended` 10 (check-taxonomy-hits-base-1795773426084-3960808.log). The report is counting mode-sense hits after hand-classification, not raw hits, and the two numbers are therefore not comparable columns — but the table presents them as if they were. Deferred because: the decision-relevant values are the base-0/final-0/final-1 rows, which are correct, and the raw scan log is pasted in the leaf folder for any reader. Promotion evidence: any case where a reviewer must reproduce the report's classification without access to my review.
- **N3 — placeholder spelling drift.** `shapes.md:88` prose template says `continue <mode> (handover <time>)` while every sibling template (shapes.md:54, SKILL.md:132, autopilot.md:23) uses `<mode value>`. Deferred because both are placeholders naming the same substitution and the door copies from the example lines 57–58; the concrete entries written are identical either way. Promotion evidence: a real CHART.md entry written with a literal `<mode>` or `<mode value>` token.
- **N4 — worker u1's unverifiable full-test claim** (already disclosed in the report): its claimed green `bun test` run has no check log and the cited command errors on this bun version. Deferred because A's own `akrogon verify` ran the full configured suite green on the merged head, closing the evidence gap completely; the residue is process truthfulness, not product correctness. Promotion evidence: a second occurrence by any worker would argue the brief template needs a verification line.

## Verdict

`nits` — no Fixes. Every done-criterion is met on the reviewed head with green verification; the four Nits are deferrable concerns with named promotion evidence.

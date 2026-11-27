# Draft leaf review: slot B
**F1. The named logo file is a raster wrapper, so "inline paths" cannot be done.** charting-pictures design, "Mark: .../public/logos/tamdoma-logo-light-bg.svg, paths copied inline and scaled small"; guide-pictures design `Style:` line; forks/docs-shape.md Q3.
- Evidence: that file is 133,786 bytes with 2 `<image>` data URIs and 1 `<path>`. Copying it puts `href="data:image..."` in every picture, fails criterion 2 and adds about 134 KB each.
- Fix: name the vector sources. Mark: `website/public/favicon.svg` (362 bytes). Name: `website/public/logos/tamdoma-logotype-dark-bg.svg` (6,313 bytes, 8 paths, no images), recoloured to ink.

**F2. The attribution text doubles the name.** charting-pictures criterion 2, `next to the text "created by Tamdoma"`; guide-pictures criterion 2, `finds the "created by Tamdoma" mark text`.
- Evidence: forks/signposts.md Taken 5, `(created by Tamdoma ("Tamdoma" = Tamdoma logo)`. The logo stands in for the word.
- Fix: the text "created by" followed by the logo, with `<title>Tamdoma</title>` on the logo group. The report's search looks for "created by" and that title.

**F3. The unpark command and the epic count are wrong.** Q6 in forks/docs-shape.md, copied into all five design.md: "one epic `builder-docs` with five issues" and "runs `akrogon unpark guide-chapters guide-pictures`".
- Evidence: the drafts hold two epics. docs/use/park-pause-stop.md: "`<issue>` is the top-level folder name". docs/reference/commands.md:38: `akrogon unpark <issue>...`.
- Fix: "two epics" and `akrogon unpark builder-docs-rest`, in the fork and the five copies.

**F4. Wrong fact about a test.** guide-chapters design: "tests/run-permit.test.ts needs /run permit/i somewhere in README.md or docs/."
- Evidence: tests/run-permit.test.ts:796-806 expects no match in README.md, docs/**/*.md and src/AREA.md. A writer who follows the line turns the test red. Fix: "bans /run permit/i in README.md, docs/**/*.md and src/AREA.md".

**F5. Nobody owns the previous/next lines of pages 04 and 08.** charting-guide design: "a previous/next line naming only pages that exist at landing". guide-chapters design: "This leaf links them and does not rewrite them."
- Consequence: after guide-chapters lands, 04 has no link back to 03 and 08 none on to 09.
- Fix: guide-chapters owned surfaces add "the previous/next lines of docs/guide/04 and 08". Criterion 4 adds "every guide page's previous/next line names its neighbours".

**F6. docs/reference/where-things-go.md has two writers and no keep rule.** charting-pictures owns "the picture lines". guide-chapters has "where-things-go.md and words.md rewritten". guide-pictures reads the style from that page.
- Fix: guide-chapters design adds "keep the picture-style lines charting-pictures wrote unchanged".

**F7. taxonomy-rename criterion 4, "the diff touches only files under skills/", collides with a repo rule.**
- Evidence: docs/reference/where-things-go.md:28, "A change to `src/` or `skills/` updates the page that owns each fact it changes, in the same change", and learnings/LESSONS.md:16. docs/reference/words.md:5 and :29, docs/reference/skills.md:16, docs/use/autopilot.md:11 and docs/use/plan-work.md:36 keep the old mode words until guide-chapters, which is parked with no date.
- Fix: add those four pages to this leaf's owned surfaces, mode-word edits only, and change criterion 4 to "skills/ and those four pages".

**F8. The guard's exemption has no home, and one qualifier cannot be tested.** guide-chapters criterion 6: "outside the compatibility sentence taxonomy-rename wrote" and "(as a mode name)".
- Evidence: taxonomy-rename criterion 2 fixes no form for that sentence, so a test cannot find it. A text match cannot judge "as a mode name".
- Fix: taxonomy-rename criterion 2 adds "the sentence is one line that starts with `Old record words:`". guide-chapters criterion 6 becomes: the four literal phrases, case-insensitive, in README.md, docs/**/*.md and skills/**/*.md, skipping only lines that start with that lead. Drop "(as a mode name)".

**F9. taxonomy-rename design misses three test consumers of the files it edits.** Its line: "No src/ or tests/ code parses mode words or the `Route:` line".
- Evidence: tests/docs-links.test.ts ("chart-issues skill names akrogon pack at every end-marker site") needs three or more `akrogon pack <chart>` literals in SKILL.md, one of them in the "On the direct route" sentence. tests/chart-shapes.test.ts pins `## Operator decision (` in SKILL.md and the `### readiness.yaml` fence in shapes.md. tests/watch-timer.test.ts reads skills/AREA.md (no "cron", no "expir", the `scripts/observe.ts` line). Fix: list the three under the consumer paragraph.

**F10. guide-chapters design under-states the watch and shelf pins.** Its tests/watch-timer.test.ts consumer line.
- Evidence: tests/watch-timer.test.ts:1392-1410 also requires the `## What each check does` section to hold no "akrogon status", and the old path sits in three places (the files list, the path list, the `path ===` comparison). tests/docs-links.test.ts:278-305 needs "(script)" in docs/reference/checks.md and files.md, and a verify-runs.jsonl row in files.md. Fix: add both to the consumer list.

**F11. Slot B's abilities are assumed, not placed.** charting-guide criterion 4 and guide-chapters criterion 7 ("a fresh subagent inside its review session"); both picture leaves' criterion 4 (render and read screenshots).
- Evidence: the default `slots.b` in the machine config is the codex harness, the four ISSUE.md files set only `a:`, and skills/check-issue/SKILL.md has no subagent step. I did not verify what that harness can do. Fix: add a `b:` seat known to do both to the four ISSUE.md files, or state in each design what B does when its harness has no subagent tool.

**F12. Cold-reader question 3 has two right answers.** charting-guide design: `"I'm going to bed ... What do I pick and what do I still answer?" Semi-autopilot: ... Full autopilot: ...`, under "Each question has one right answer".
- Fix: ask "Which two Charting modes fit, and what do you still answer in each?"

**F13. "Reviewed by slot B" on the Direct route names the wrong agent.** charting-guide criterion 2: "Direct is the charting agent building one small, settled change itself ..., reviewed by slot B."
- Evidence: skills/chart-issues/SKILL.md `## Direct route`: "B — the first named peer — reviews". That is the charting agent's first consultant, not the fresh slot B seat of a Lifecycle task. Criterion 5 then fails on the page criterion 2 asks for. Fix: "reviewed by the charting agent's first consultant, acting as slot B".

**F14. Three retired topics have no named home (signposts 3a, "the documentation is complete").** guide-chapters brief, page list and criterion 2.
- Evidence: grounding setup (docs/start/set-up-a-project.md:58), why a ready task does not start and the dispatch order (docs/use/run-work.md:46-73), and `akrogon next` as the step that starts handed-off work (charting-guide question 6 says hand-off does not start it). Fix: criterion 2 names grounding on page 02. Criterion 3 names starting work and the dispatch order on page 09.

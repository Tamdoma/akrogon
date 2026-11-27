# Map: slot A

Evidence: Haiku inventory (35 pages, 19 SVGs, pinned tests), Haiku mode-word scan, tamdoma website tokens (INTAKE agent findings), hc ls.

## Forks

F1 Page architecture. Rec: README as a short front door (what it is, who it is for, one picture, chapter list). docs/ holds numbered chapters: 1 Set up (install, one akrogon per machine serving many registered repos, upstream example, herdr space and the three tabs), 2 Charting (modes, routes, signposts, decisions, day-to-day), 3 Lifecycle (slot A, slot B, how they pass work), 4 Merging, 5 While you are away and when work stops (watcher, failed, park/pause/stop), then a lookup shelf (today's reference/ pages, kept, words updated) and minor features named briefly (lessons, reports, rollback, sync, broadcast). Cost: docs/start, docs/use, docs/examples are rewritten or deleted; links in every page change.
F2 Pinned tests. Pages tests read must keep their paths or the tests move in the same leaf: roll-back-a-release.md (rollback.test.ts:140), watch-while-away.md + watch-loop.svg (watch-timer.test.ts:1367-1410), commands.md (command-reference.test.ts), checks.md/files.md "(script)" and verify-runs row (docs-links.test.ts:278-305), "run permit" somewhere in docs (run-permit.test.ts:776), forbidden words (hold-retired.test.ts), all links resolve (docs-links.test.ts). Rec: keep the lookup shelf paths and the two test-read use pages' content claims; any moved page moves its test assertion in the same leaf.
F3 Pictures. 5 to 7 static SVGs in tamdoma style (parchment #F4F1E6, ink, sage scale, Bricolage/Schibsted fonts with system fallbacks since GitHub SVG-as-img loads no web fonts), light and dark via prefers-color-scheme inside the SVG, small "created by Tamdoma" + logo bottom corner from website/public/logos. Old 19 pictures: delete those no page embeds after the rewrite; grounding.svg is orphaned already; watch-loop.svg is test-read.
F4 Rename in the system. No src/ or test code prints or parses mode or route words. Scope is prose in skills/chart-issues (SKILL.md, autopilot.md, shapes.md, handover.md, questions.md, standing-design.md), skills/AREA.md, README. Risk: mode-record literals "continue autopilot", "continue attended", "attended next" are matched by the door itself reading the latest entry (SKILL.md Autopilot); old CHART.md files keep the old words. Rec: the new templates write new words and the skill reads old words as their new equivalents (one line). The skill change reaches doors only after release.
F5 Cold reader and order. Charting chapter leaf first (signposts 7a), operator read is a needs row; other chapter leaves blocked-by it. Cold-reader: a model reads a page alone and answers fixed questions; judged by slot B under standing-design's model-choice line, no score.
F6 Leaf split. Rec: L1 charting chapter (+ its pictures? no: pictures separate seat recipe), L2 rename in skills (independent, no docs dependency), L3 pictures (claude opus), L4 setup + tabs chapter, L5 lifecycle + merging chapters, L6 away/stops chapter + lookup shelf + README + deletions. L4 to L6 blocked-by L1 (style pattern). Different seats need separate ISSUE.md slots blocks, so writing leaves and the picture leaf sit under different issues of one epic.

## Practitioner questions

- Diátaxis (tutorial / how-to / reference / explanation) is the common docs frame; the operator asked for "a pure guide with examples", which is the how-to plus tutorial side.
- Does every chapter end with "what you do next"? Does each show one worked example?

## Pitfalls

- Two earlier rewrites missed: the fix is the operator read of chapter 2 before the rest.
- GitHub renders SVG as img: no web fonts, no external links, no scripts; dark mode only via in-SVG media query.
- Renaming in skills while docs still say old words: same epic, both land; docs use new words only.
- Private client names leaking: examples use made-up names (signposts 6).
- Docs going stale: where-things-go.md keeps one home per fact.

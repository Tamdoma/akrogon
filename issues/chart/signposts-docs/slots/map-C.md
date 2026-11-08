# Map C: signposts-docs

Slot C, 2026-11-04. Inspected: the eight files d6bb6429 touched, 9ee76bf6, 5499e3da, `skills/chart-issues/SKILL.md` (Open, Drain, Take, Autopilot, Handover), `assets/shapes.md` (Chart records, Mode record, Autopilot, signposts fork shape), `assets/questions.md` (signposts paragraph), every page under `docs/`, the five `docs/pictures/*.svg` the docs text names, `README.md`, `skills/AREA.md`, `src/AREA.md`, `src/status.ts` `chartRow`, the live records under `issues/chart/{round-drawings,grant-run-count,proof-limits-handoff}`, and the two open-leaf briefs. Skipped: the other 14 pictures (no chart or door content by name), `docs/reference/{config,checks,state-and-phases,releases-and-updates}.md` (no chart content on grep).

Rule source for every item: SKILL.md Open "The signposts round sets…", Drain "else to the first chart not waiting in the session's signposts order … a dropped chart or seed … is not charted this session", Autopilot paragraphs 1, 2 and 9, Handover paragraph 2, shapes.md Chart records tree plus the `forks/signposts.md` paragraph before the Intake shape, shapes.md `## Autopilot` `signposts:` line, questions.md signposts paragraph.

## What the rule added (the checklist the docs must cover)

1. `forks/signposts.md`: a fork-shaped file, original in the chart where the round ran, verbatim copy in every other chart of the session at folder creation naming the original, corrections appended to the original with a date and re-copied to open charts; dropped charts or seeds listed in the original.
2. The round: once per door session, after intake import and consultant restart, before any map; one consultant exchange adds missed angles first; no research line; 4 to 7 questions; latest earlier record on the same repo offered as "same or change"; one short account of what the session prioritizes and gives up.
3. The three modes and the door session (survives pass end, compaction, handovers; a chart resumed in a later door run takes that run's signposts); words that delegate only the signposts are asked about; mid-chart switch-on with no signposts asks the round first.
4. Unanswered, correction and conflict rules (manual: re-asked before the first fork; autopilot: recorded unanswered, built-in values fill; full autopilot: A answers; conflicts asked in one line except under full autopilot).
5. Drain: signposts order is the operator-named chart order; dropped charts or seeds are not charted.
6. Handover entries carry `signposts <path>`; a next-chart folder old A creates also holds the verbatim copy; `## Autopilot` has `signposts: <operator | A>` plus the original's path.
7. `akrogon status --charts`: `TAKEN` is `n/m` over every `forks/*.md` whose `## Taken` has content (`src/status.ts:478-485`), so `forks/signposts.md` counts as one fork in both numbers.
8. The rule applies to door sessions opened after it lands.

## Inventory

Status per item: **missing** (nothing says it), **stale** (said, now wrong or incomplete), **ok** (listed so A sees it was checked).

### docs/reference/files.md (the "file references" the operator named)

- F1 **missing**, "Layout of issues/" table, `chart/<chart>/` row: says "One folder per chart, with `CHART.md` and its fork files. A direct-route attempt keeps … in `direct/`." Nothing names `forks/signposts.md`, that it is one file per chart with one original and copies, or that it sits under `forks/` without being one of the chart's own forks. shapes.md Chart records lists it with a comment. This is the one place the file layout is documented for people.
- F2 **missing** (pre-signposts, adjacent, low confidence on scope): the same row also omits `INTAKE.md`, `seats.yaml`, `USAGE.md` and `slots/`, all of which shapes.md Chart records lists. Lock 4a ("the whole family … since signposts") covers F1 for sure. Whether the row should be brought level with the whole shapes.md tree is a fork (see Forks).
- F3 **ok**: no `files.md` section is a heading target for signposts links, so no anchor changes.

### docs/use/plan-work.md

- F4 **stale**, "Open a chart", sentence "Its first reply names the chart consultants you gave it, or says A works alone.": SKILL.md Open now says the first reply also names the mode and who answers the signposts.
- F5 **stale**, "Open a chart", "Each fork has its own file under `forks/`." and "`akrogon status --charts` lists your charts.": `forks/signposts.md` is also under `forks/` but is the session's record, not a chart fork, and `status --charts` counts it in `TAKEN` (item 7). Neither is said anywhere in docs.
- F6 **missing**, "Set the signposts": the section covers the round, the mode split, the re-ask in manual mode and the "same or change" offer. It does not say: one consultant exchange adds missed angles first (item 2); the record is an original in one chart with verbatim copies in the session's other charts, and corrections go to the original and are re-copied (item 1); a dropped chart or seed is not charted that session and the chart order is the session's order (item 5); the one-line account of what the session prioritizes and gives up (item 2); what "door session" means (item 3, survives compaction and handovers, a chart resumed in a later run takes that run's signposts); the autopilot handling of an unanswered question (built-in values fill, not re-asked, item 4); corrections and conflicts (item 4). Which of these belong in a user page versus staying a link to the skill is a fork (Forks, O-depth).
- F7 **ok** but a pitfall: "Answer one fork per round" holds the sentence "The picture shows the per-chart exchange; the signposts round above runs once before any map." The open leaf `round-drawings/option-drawings` adds one sentence to this same section. Edit nothing else in that section; if the picture changes (F15) this caveat sentence may go, which is in the section the other leaf touches. Coordinate or leave the sentence.
- F8 **ok**: "Review the handoff" was rewritten by 5499e3da today (proof-coverage). Stay out.

### docs/use/autopilot.md

- F9 **stale**, "Switch it on", "You can also switch it on later in the same door, naming a chart. Answers you already gave in that chart stay yours.": SKILL.md Autopilot adds that a session switched on mid-chart with no signposts yet asks the signposts round before A answers anything. Missing here.
- F10 **stale**, "What the door does": says the signposts round "waits for your one answer". SKILL.md says under autopilot it is a presented round, not a wait (no chart parks on it, no chart work starts before it). The doc wording reads as a wait. Also missing: a drop A would make under full autopilot is recorded only, for the operator.
- F11 **missing**, "What still waits for you", first sentence "the door moves on to the next chart on the list": the order is the session's signposts order (Drain). Low confidence whether this page or plan-work.md owns it.
- F12 **ok**: "On a long run…" paragraph says the fresh conversation gets the session's signposts. It does not say a next-chart folder old A creates holds the verbatim copy (item 6). Low confidence it belongs in a user page; shapes.md and SKILL.md own it.
- F13 **ok**: "Read the record" lists who answered the signposts. Could name the `signposts:` line and that it points to the original's path. Low priority.

### docs/reference/words.md

- F14 **stale**, "Chart door" entry: "It is called A, asks you one fork per round and writes the leaves." The door now opens with the signposts round, then one fork per round. The "Signposts" and "Autopilot" entries are current. The "Fork" entry ("one open question in a chart") is fine but does not say `forks/signposts.md` is not one; the files.md fix (F1) covers that better than the glossary.

### docs/pictures/chart-door.svg

- F15 **stale** (judgment, medium confidence): the picture's steps are blind note, merge, rebuttal, rounds, forks taken, handoff review, contract. No map step and no signposts step. 9ee76bf6 and the F7 caveat sentence were added instead of changing the picture, so the picture now contradicts the text order (signposts, map, rounds) unless the reader reads the caveat. Lock 4a allows changing an existing part. Options in Forks.
- F16 **ok**: `ways-to-run.svg` "Autopilot chart: door answers itself" is loose (under autopilot the operator still answers the signposts) but not wrong as a summary of the picture's purpose. Low confidence that it needs a change. `working-day.svg`, `factory-overview.svg`, `project-folders.svg`: no step detail at the signposts level, nothing to change.

### docs/start/what-it-is.md, docs/use/a-working-day.md

- F17 **ok**: both name the signposts round before the map and before the per-fork questions. Match the skill.

### docs/reference/skills.md

- F18 **stale** (low confidence on whether to change): chart-issues entry says "It asks you questions in chat. Autopilot runs only when you switch it on in words." No mention of the signposts round or that three modes exist. The "Result" line still reads "charts of open questions (forks)". One sentence would make this page match plan-work and words. Could also stay a link.

### docs/reference/limits.md

- F19 **stale** (low confidence): "Choose the work. You open the chart door, answer each fork and approve the handoff. A recommendation cannot stand in for your answer." Under the modes you answer the signposts too, and under full autopilot A answers both and may only order, never drop, the handed charts. The "never drop" rule is the limit that belongs on this page. Pre-existing looseness about autopilot forks is not from signposts.

### docs/reference/commands.md

- F20 **missing** (low confidence on home): the `akrogon status` row does not describe the `--charts` columns at all (`TAKEN n/m`, `FOG`, `STAGE`, `AGE`). So the fact that `TAKEN` counts `forks/signposts.md` has no home. If the columns stay undocumented, F5 in plan-work.md is the only place to say it.

### docs/README.md, docs/reference-index.md, README.md

- F21 **ok**: page lists and one-line descriptions. "Autopilot: let the chart door chart and hand off a fixed list of work without asking you each question" is still true. No signposts mention needed at that level.

### skills/AREA.md, src/AREA.md

- F22 **missing** (pre-signposts, adjacent, low confidence on scope): `skills/AREA.md` Key files never lists `skills/chart-issues/SKILL.md` or its assets at all, so nothing there is stale about signposts; it was already silent. `src/AREA.md` does not describe `status --charts`. Both are agent-facing indexes. Flag for the operator's "file references" phrase; I would not treat them as part of the signposts family.

### skills/chart-issues (rule text, the source)

- F23 **ok**: SKILL.md, shapes.md and questions.md agree with each other on items 1 to 8. One nit, low confidence: shapes.md Chart records tree comment says "(original in one chart, verbatim copy elsewhere)" and the Mode record shows `signposts <path or none>` while Handover prose says `signposts <path>`; the `or none` form covers sessions opened before the rule. Not a docs defect.

### docs/examples/autopilot-story.md, quick-fix-story.md, one-change.md, recovery-story.md

- F24 **ok**: true stories from before the rule. Item 8 says the rule applies to sessions opened after it landed, so the stories need no signposts step. Do not touch.

## Forks

- O-depth: how much of the signposts rule the user pages carry. (a) plan-work.md "Set the signposts" states the whole user-visible behaviour (F6 list) in a few sentences and the skill stays the source for records; (b) plan-work.md states only what the operator sees (consultant exchange, the account line, copies across charts, dropped charts) and links the skill for the rest; (c) docs stay as they are and only the file references (F1, F5, F14, F4) change. where-things-go.md "One home per fact" argues against copying skill steps; the operator's intake asks for a documentation update, not a rewrite. I lean (b).
- O-picture: chart-door.svg (F15). (a) add two boxes above "B: blind note" for signposts and map, drop the F7 caveat sentence; (b) leave the picture, keep the caveat. (a) touches the section the option-drawings leaf edits (F7). (b) adds no parts and is the current state. Low confidence; the operator's 4a lock ("when it adds no parts") reads to me as favouring (b) for the picture and (a) only if the caveat sentence can stay.
- O-files-row: files.md `chart/<chart>/` row (F1, F2). (a) name only `forks/signposts.md` with original and copies; (b) make the row match the full shapes.md tree (`INTAKE.md`, `seats.yaml`, `USAGE.md`, `forks/signposts.md`, `slots/`, `direct/`). (b) is the same row, no new parts, and fixes the pre-existing drift in one edit. I lean (b).

## Pitfalls

- P1 plan-work.md "Answer one fork per round" and "Review the handoff" are touched by the open option-drawings leaf and today's proof-coverage merge. Keep every signposts edit in "Open a chart" and "Set the signposts", or coordinate through `blocked-by`.
- P2 `tests/docs-links.test.ts` checks every link and heading anchor. words.md links `plan-work.md#set-the-signposts`; renaming that heading breaks the test.
- P3 `status --charts` counts any `forks/*.md` with a non-empty `## Taken`. A doc that says "n/m forks" should say the signposts record is one of them, or the counts look off by one to a reader.
- P4 The skill says copies are made "at folder creation". A reader of files.md who sees two `signposts.md` files in one session should learn from the doc which is the original (the copy's first line names it, and the chart's `CHART.md` Forks taken line says "copy; original in <chart>"). Live records confirm this shape.
- P5 Scope lock 1c (written rules only) means no `status` code or test changes in this chart; F20 is a docs-only question.
- P6 Pictures are hand-written SVG with a background card (where-things-go.md). Editing chart-door.svg means moving every y coordinate below the inserted boxes and the viewBox height. Doable but it is the one non-text edit in the family.

## Split

One leaf, docs-only, no `src/`, `tests/` or `skills/` changes: `docs/reference/files.md` (F1, F2 per O-files-row), `docs/use/plan-work.md` "Open a chart" and "Set the signposts" (F4, F5, F6 per O-depth), `docs/use/autopilot.md` "Switch it on", "What the door does", "What still waits for you" (F9, F10, F11), `docs/reference/words.md` Chart door entry (F14), `docs/reference/skills.md` chart-issues entry (F18), `docs/reference/limits.md` "Choose the work" (F19), and chart-door.svg only if O-picture (a). Done-criterion shape: reading Open, Drain and Autopilot in the skill beside the touched pages names no file, step or mode the pages lack, and `bun test tests/docs-links.test.ts` passes. No second leaf: everything shares one destination and one reviewer can read it in one sitting.

Low-confidence items: F2, F11, F12, F13, F15, F16, F18, F19, F20, F22, O-picture.

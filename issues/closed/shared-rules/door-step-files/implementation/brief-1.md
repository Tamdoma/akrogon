# Brief 1 — door-step-files U1: SKILL.md cuts and three step files

Worktree: `/home/ivan/.akrogon/worktrees/akrogon/door-step-files-u1` (detached at leaf HEAD, `bun install` first).

## 1. Goal

Split the door skill's three step sections per plan D1–D6: move the Direct route protocol/repair/growth/continuations detail, the autopilot behavior detail, and the handover action detail into three new files under `skills/chart-issues/assets/`; keep in `SKILL.md` under each kept heading only what a door needs before that step arrives. Plan D1–D6 is binding.

## 2. Numbered acceptance criteria

1. `SKILL.md` keeps headings `## Direct route`, `## Autopilot`, `## Handover`; under each stays the kept content below plus one read directive naming its step file.
2. `skills/chart-issues/assets/direct-route.md`, `assets/autopilot.md`, `assets/handover.md` exist, each opening with `# <title>` and a one-line "Read when …" preamble (convention of `assets/questions.md`, `assets/shapes.md`).
3. Every moved clause keeps its wording and meaning verbatim — no rule lost, none changed; only the citation repoints listed below differ.
4. Kept content: direct-route intro paragraph, refusal bullet list, route-question paragraph; autopilot first paragraph (three modes), the start rule, and the mode-record rule; handover trigger paragraph and the "Any session that receives a start prompt" check paragraph.
5. `bun test tests/docs-links.test.ts` fully green in the worker worktree after the change (the planned test edit already reads `assets/direct-route.md`).

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — the whole file; sections at lines ~93–135 (Direct route), ~135–157 (Autopilot), ~157–171 (Handover).
- `skills/chart-issues/assets/questions.md`, `assets/shapes.md` — the file-shape convention to copy (title + "Read when" preamble, no front matter) and the citing files another worker edits (do not touch them).
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`.
- `/home/ivan/Work/infra/akrogon/issues/open/shared-rules/door-step-files/plan.md` — decisions D1–D8.

## 4. Change list and needed interfaces

Owned paths (edit/create only these): `skills/chart-issues/SKILL.md`; create `skills/chart-issues/assets/direct-route.md`, `assets/autopilot.md`, `assets/handover.md`. Must land first: nothing. Shared test resources: none. Parallel workers edit `assets/questions.md`, `assets/shapes.md`, `skills/AREA.md`, `docs/reference/files.md` — never touch them.

`## Direct route` (cut per D1):
- Keep verbatim: intro paragraph ("The direct route is a second ending…"), the refusal list ("Direct is not offered…" through the six bullets), the route-question paragraph ("When eligible, the review asks one route question…" including `Route:` record and push authority).
- Move verbatim into `assets/direct-route.md`, in order: "Protocol, using the shapes in shapes.md:" + numbered steps 1–5; "Repair bound: …"; "Growth stop: …" + Continuations bullets; "No new direct attempt starts while a chart names a live direct branch."
- `verify --holder <chart>/direct --known-red` stays exactly as written inside the moved protocol. The two `` `akrogon pack <chart>` `` literals move with steps 9 and abandon; the third stays in `SKILL.md` Handoff.
- Append directive under the heading after the kept text: the door reads [direct-route.md](assets/direct-route.md) when the direct route is chosen.

`## Autopilot` (cut per D2):
- Keep verbatim: first paragraph ("Autopilot is a non-default mode…" whole paragraph: three-mode definition, delegate-signposts-only clarification); in paragraph 2 keep only the start rule "Autopilot starts only from the operator's words in the door's own terminal, at door start or later naming a chart; the words carry the mode, the handed work and the consultants or none. Outside hc the door says autopilot cannot start."; in paragraph 7 keep "the door reads the latest entry before continuing: the same A transcript path continues after compaction, while a different or unknown path starts attended until the operator says "continue autopilot", which resumes the same handed list with lost consultants still lost." (it keeps the entry-append clause that introduces it — "Every mode change (on, off, changed list, "continue autopilot") is appended to the mode record with its time" — since that clause and the read rule are one rule; move the final sentence "Once off, an open peer turn is collected first and the next question goes to the operator.")
- Move verbatim into `assets/autopilot.md`, in order: paragraph 2 remainder (first-reply echo, needs-sheet preview, INTAKE.md verbatim words, mode line, mid-chart switch-on rules, signposts-as-presented-round, full autopilot signposts); paragraph 3 (waits list); paragraph 4 (new-chart proposal protocol); paragraph 5 (lifecycle route, drain, seed matches, held-work detection); paragraph 6 (consultant drops); paragraph 7 remainder (mode ends, stays on across waits, operator's words end it, resume entry semantics); paragraph 8 (CHART.md records, pass-end lines); the two handover paragraphs (handed-list entry, autopilot folder contents, `continue autopilot (handover <time>)` resume entry, seats.yaml deferral) — D4: they live in autopilot.md, not handover.md.
- Append directive: the door reads [autopilot.md](assets/autopilot.md) when the session's mode is autopilot or full autopilot.

`## Handover` (cut per D3):
- Keep verbatim: trigger paragraph ("A handover resets A's terminal…" through the never-list); the check paragraph ("Any session that receives a start prompt…") with this one required edit per D4: replace the unconditional "It appends `continue attended (handover <time>)`" with wording that names the resume entry from the session's mode — attended sessions append `continue attended (handover <time>)`, and a session whose mode record shows autopilot appends the autopilot resume entry per [autopilot.md](autopilot.md) — so an autopilot fresh A is never told to write `continue attended`. Keep everything else of that paragraph verbatim (the seats.yaml deferral clause inside it stays; it is correct for both modes because autopilot's deferral rule is consistent with it).
- Move verbatim into `assets/handover.md`: old-A paragraph (entry append, next-chart folder creation, door-reset.ts launch, start-prompt construction); helper paragraph; operator-input cancellation paragraph; harness support paragraph.
- Append directive: the door reads [handover.md](assets/handover.md) when Drain moves on to a named next chart.

Citation repoints inside `SKILL.md` and moved text (D5):
- `SKILL.md` Open: "under autopilot the first reply follows `## Autopilot` for its other contents" → names [autopilot.md](assets/autopilot.md) (the first-reply contents moved).
- `SKILL.md` Drain: "per `## Autopilot`" (autopilot drain behavior) → [autopilot.md](assets/autopilot.md); "resets A per `## Handover`" → [handover.md](assets/handover.md).
- `SKILL.md` Handoff: "answered by A itself per `## Autopilot`" → [autopilot.md](assets/autopilot.md). "the route question or the one-line refusal from `## Direct route`" stays. Refusal bullet "under autopilot (`## Autopilot`)" stays. Line 10 "(## Autopilot)" stays. Signposts paragraph "who answers it in `## Autopilot`" stays.
- Moved autopilot handover paragraphs' "per `## Handover`" (×2) → [handover.md](handover.md). The autopilot text's `## Autopilot` self-cite ("recorded as A's in `## Autopilot` (`signposts: A`)") refers to the CHART.md section per shapes.md — keep verbatim.
- Where moved text names a sibling asset file (e.g. "shapes.md", "questions.md"), make it a sibling-relative link ([shapes.md](shapes.md)). No link may resolve outside `skills/chart-issues/` (the link test enforces a per-folder bound).
- Step files get `# Direct route` / `# Autopilot` / `# Handover` headings and a "Read when …" preamble naming the trigger the SKILL.md directive states; moved text follows verbatim in original order. No front matter.

## 5. Do-not, reasons and exceptions

- Do not edit `assets/questions.md`, `assets/shapes.md`, `assets/standing-design.md`, `skills/AREA.md`, `docs/`, `scripts/`, `tests/` — owned by sibling workers or already committed; tests are locked.
- Do not reword, compress or reorder any kept or moved clause — the report's clause table audits per-clause moves; only the listed cite repoints and the one D4 sentence edit differ. Exception: a clause that physically cannot stand (e.g. a pronoun whose antecedent moved away) is a mismatch — return it, do not invent wording.
- Do not write or edit any test. A planned test red after your change is a mismatch, not a repair target.
- Mismatch path: name the conflicting requirement with evidence; smallest brief correction; stop.

## 6. Ordered steps

1. `bun install` in the worktree; confirm `bun test tests/docs-links.test.ts` currently shows the two ENOENT reds (expected before your work).
2. Create `assets/direct-route.md`, `assets/autopilot.md`, `assets/handover.md` with heading + preamble + moved text per section 4.
3. Apply the `SKILL.md` cuts, repoints, directives and the D4 sentence edit.
4. Run `akrogon run-check --name u1-docs-links -- bun test tests/docs-links.test.ts` — full file must be green.
5. `git diff` self-audit: every clause of the three sections appears exactly once across SKILL.md + the three files, in order; then commit all changes as one commit.
Advisory size: 4 files, under 40 turns.

## 7. Commands

- `akrogon run-check --name u1-docs-links -- bun test tests/docs-links.test.ts` (targeted check for this unit).
- `wc -w skills/chart-issues/SKILL.md skills/chart-issues/assets/direct-route.md skills/chart-issues/assets/autopilot.md skills/chart-issues/assets/handover.md` — record the numbers in your report (criterion 6 input).

## 8. Done-when, evidence and report

Commit ID returned; `check u1-docs-links: <exit> <path>` line cited; word counts pasted; self-audit statement. End with:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

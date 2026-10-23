# Plan: docs-use-plan

Debate: no. Synthesized directly from brief.md and design.md. Base `40902d83`. All three blocked-by leaves have landed on this base: the six pictures are in `docs/pictures/`, and `docs/reference/commands.md`, `skills.md` and `config.md` exist.

## Read first

- `docs/reference-index.md` (grounding index). `src/AREA.md`, `skills/AREA.md`, `tests/AREA.md`.
- `learnings/LESSONS.md` lines on stale rules in docs and on sweeping prose for old terms (2026-09-11, 2026-09-10). These apply because each page restates behavior that lives in `src/` and `skills/`.
- Door page map: `/home/ivan/Work/infra/akrogon/issues/chart/beginner-docs/PAGE-MAP.md`. Rows 24-36 (owned pages), line 94 (working-day spec), line 115 (door-reset test row). Read only. Never edit it.
- Authoring sources (old claims never win over code): `docs/guide/in-practice.md`, `docs/guide/chart.md`, `docs/guide/create.md`, `docs/guide/next.md`.
- Fact sources: `src/akrogon.ts` (command table), `src/next.ts`, `src/stop-run.ts`, `src/leftovers.ts`, `skills/chart-issues/SKILL.md` (attended mode, Direct route, Autopilot), `skills/seed-issue/SKILL.md`, `skills/watch-issues/SKILL.md`, `skills/broadcast-issue/SKILL.md`.
- Link targets: `docs/reference/commands.md`, `docs/reference/skills.md`, `docs/reference/config.md`, `docs/pictures/*.svg`.

## Decisions

- D1 Page shape. Each page has an `#` title, one or two sentences on what the job is and when you want it, the steps or explanation, and one last line `Next: [<page title>](<path>)`. Steps say what the reader runs, sees and why. Agent procedure is not restated. The page links the owning skill instead. These are how-to pages, not a tutorial: no exercises, "now you try" or practice project (doc-architecture Q3).
- D2 Optional steps are marked with the word "Optional" at the start of the step or sentence. This covers watch-issues, broadcast and GitHub intake (`akrogon pull`, seed-issue) on every page that names them.
- D3 Direct work wording. Every page that mentions the direct route says it skips the leaf handoff and `akrogon next`, and keeps the charted decisions and seat B review (brief criterion 1). Every page that mentions autopilot says it charts and hands off, and starts no execution.
- D4 Next-step chain: a-working-day → plan-work → quick-fix → autopilot → write-issues-by-hand → report-an-observation → run-work → park-pause-stop → watch-while-away → `../reference/commands.md`. The last page points at the command reference because the use/ part 2 pages belong to docs-use-finish, which is not in blocked-by.
- D5 Link rule. Pages link only to the nine owned pages, `docs/reference/*.md`, `docs/pictures/*.svg`, `skills/**` and `src/**`. They do not link `docs/guide/`, use/ part 2, `examples/`, `start/`, `docs/README.md` or `README.md`. Sibling links target files without anchors, so pages written in different waves never depend on a heading in another page.
- D6 Pictures. A page whose map row names a picture embeds it as `![<alt>](../pictures/<name>.svg)` near the start of the concept it shows. Alt text is one sentence on what the picture shows, based on the SVG's `<title>` and labels. The pages are a-working-day (working-day), plan-work (chart-door, ways-to-run), run-work (dispatch-order), park-pause-stop (control-states) and watch-while-away (watch-loop). Rows marked "linked" (quick-fix and autopilot → ways-to-run in plan-work, report-an-observation → working-day for intake) use a text link to the page that shows the picture and embed nothing. write-issues-by-hand has no picture.
- D7 Facts. Every command, flag, file, phase and behavior on a page is checked against current `src/` and `skills/` before it is written. Where an old guide page disagrees, the code wins and the old claim is dropped. Commands are written exactly as `src/akrogon.ts` parses them, with `docs/reference/commands.md` linked for the full list. Pages contain no dates, no names of retired commands or settings, and no "was removed" or migration notes.
- D8 Names. "Chart consultants" (charting helpers) and "seats" (slot A and B on a leaf) are named apart (doc-architecture Q1). Placeholders only, never real keys, private project names or home paths.
- D9 Door-reset scope. Only the `docs/guide/chart.md` read and its "handover" check in `tests/door-reset.test.ts` are removed. The skill and shapes wording checks and every behavior test stay. Note for review: brief criterion 3 says "the door-reset documentation check and its read of docs/guide/chart.md are removed". The door-owned map row (PAGE-MAP line 115) is narrower: "Remove the guide/chart.md read and its 'handover' wording check. Behavior tests are kept." This plan follows the map row because it is the copied design input and the skill checks do not read a docs page. Done in planning commit `d0f4ea1d` with a `Test-Change:` trailer.
- D10 No inbound links change. This leaf moves no page, so README and `docs/reference-index.md` stay untouched. docs-start owns them.

No `Open for the plan:` questions exist in the design. No credentials are named (`env: []`, and `akrogon status` prints no `Missing:` lines).

## Units and waves

Each unit owns one page. Each unit uses no shared test resource, and no unit needs another unit to land first, since D5 keeps sibling links anchor-free. Waves run in reverse chain order so each page's next-step target already exists when it lands.

Wave 1
- U1 `docs/use/run-work.md`. Sources: guide/next.md "The four forms", "How order…", "When picked work…", "Release work…", `src/next.ts`, `src/akrogon.ts`. Picture: dispatch-order. Next: park-pause-stop.
- U2 `docs/use/park-pause-stop.md`. Sources: guide/next.md "Parking…", "Pausing…", "Stopping…", `src/stop-run.ts`, `src/leftovers.ts`, `src/akrogon.ts` (pause, unpause, stop, start, park, unpark). Picture: control-states. Next: watch-while-away.
- U3 `docs/use/watch-while-away.md`. Sources: guide/in-practice.md "watch-issues…", `skills/watch-issues/SKILL.md`. Picture: watch-loop. Says watch is optional, runs in Claude Code every 20 minutes, and is started and stopped only by you. Next: `../reference/commands.md`.

Wave 2
- U4 `docs/use/autopilot.md`. Sources: guide/chart.md "Autopilot", `skills/chart-issues/SKILL.md` Autopilot. Links plan-work for ways-to-run. Says approvals stay with you and nothing is started. Next: write-issues-by-hand.
- U5 `docs/use/write-issues-by-hand.md`. Sources: guide/create.md "Or just write the files", "Ordering with blocked-by", `src/` leaf file parsing (brief, design, state front matter, `blocked-by`). No picture. Next: report-an-observation.
- U6 `docs/use/report-an-observation.md`. Sources: guide/create.md "seed-issue…", `skills/seed-issue/SKILL.md`, `akrogon pull` in `src/akrogon.ts`. Links a-working-day for the intake picture. Marked optional. Files an unverified observation and invents no fix. Next: run-work.

Wave 3
- U7 `docs/use/a-working-day.md`. Sources: guide/in-practice.md "A working day", PAGE-MAP line 94. Picture: working-day. The steps are a request (local note, or optional GitHub issue via `akrogon pull`), then /chart-issues, handoff, `akrogon next`, seats work, and the command lands. Optional: watch, broadcast. Direct route and autopilot per D3. Links the other use/ part 1 pages for each step. Next: plan-work.
- U8 `docs/use/plan-work.md`. Sources: guide/chart.md, guide/create.md "Which door for what", `skills/chart-issues/SKILL.md` attended mode. Covers rounds, forks, fog, consultants and the handoff review. Pictures: chart-door, ways-to-run. Next: quick-fix.
- U9 `docs/use/quick-fix.md`. Sources: guide/chart.md "Direct route", `skills/chart-issues/SKILL.md` Direct route. Covers when the door builds a small settled change itself with B review, and when it refuses. Links plan-work for ways-to-run. Next: autopilot.

Not serial-solo: waves hold three units each.

Affected docs: the nine pages above. No other agent or human doc is affected. `tests/AREA.md`, `src/AREA.md`, `skills/AREA.md` and `docs/reference/*` do not mention the door-reset guide read or these pages.

## Done-criteria and proof

The brief adds no `merge_checks` or whole-suite requirement. The repo `checks` (format, test, typecheck) run as usual at the end of implement.

1. Nine pages exist and cover their map subjects. Optional steps are marked optional. Direct work and autopilot are worded per D3.
   - Boundary: the files under `docs/use/`. Before: none exist. After: nine files.
   - Observation: `ls docs/use/` lists the nine files. `grep -n -i "optional" docs/use/*.md` shows the watch, broadcast and intake mentions. `grep -n -i -A2 "direct route\|autopilot" docs/use/*.md` shows the D3 wording. Coverage of each map subject is judged by seat B against PAGE-MAP rows 28-36.
   - Catches: a missing page, or a page that tells the reader autopilot runs work or the direct route skips B review.
   - Size: seconds (grep), minutes (review). Rerun trigger: any edit to `docs/use/*.md`.
2. Concept pages embed their picture with alt text. Every page ends with a next-step link.
   - Boundary: rendered Markdown image and link references. Existing proof: `tests/docs-links.test.ts` ("README, docs and skill links resolve to files and anchors") fails on a missing image file or a broken link in any `docs/**/*.md`. Green on base: `check docs-links: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-docs-links-1792767560632-1964224.log`.
   - Command: `akrogon run-check --name docs-links -- bun test tests/docs-links.test.ts`. Plus `grep -n '!\[' docs/use/*.md` for non-empty alt on the five picture pages (D6), and `tail -n 1 docs/use/*.md` showing a `Next:` link on all nine.
   - Catches: a broken image path, an empty alt, a dead next-step link.
   - Size: seconds. Rerun trigger: any edit to `docs/use/*.md` or `docs/pictures/`.
3. The door-reset docs check no longer reads docs/guide/chart.md, and behavior tests are unchanged.
   - Boundary: `tests/door-reset.test.ts`. Before: line 432 read `../docs/guide/chart.md`. After: no read (commit `d0f4ea1d`).
   - Command: `grep -n "docs/guide" tests/door-reset.test.ts` prints nothing. `git --no-pager diff 40902d83 -- tests/door-reset.test.ts` touches only the docs check. `akrogon run-check --name door-reset -- bun test tests/door-reset.test.ts` gives `check door-reset: 0 /home/ivan/Work/infra/akrogon/issues/open/beginner-docs/docs-use-plan/implementation/check-door-reset-1792767554957-1962254.log` (17 pass).
   - Reason for report.md: `docs/guide/chart.md` is an authoring source that docs-start deletes. The check matched a wording substring only, and fact-ownership Q2 deletes wording-only doc checks. No new test: this is a removal, so there is no new behavior to show red.
   - Catches: a test that would break when docs-start deletes the old guide.
   - Size: seconds. Rerun trigger: edit to `tests/door-reset.test.ts`.
4. Every statement matches current `src/` and `skills/`, with no retired names and no dates.
   - Boundary: page text compared with code.
   - Existing mechanical proof: `tests/hold-retired.test.ts` and `tests/run-permit.test.ts` scan every `docs/**` file for retired surfaces. Green on base in the same docs-links log above. Command: `akrogon run-check --name retired -- bun test tests/hold-retired.test.ts tests/run-permit.test.ts`.
   - Dates: `grep -nE "\b(19|20)[0-9]{2}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* [0-9]{1,2}\b" docs/use/*.md` prints nothing.
   - Commands: every `akrogon <word>` on the pages appears in `src/akrogon.ts` (A checks with `grep -o 'akrogon [a-z-]*' docs/use/*.md | sort -u` against the command table). Remaining statements: seat B checks each page against the sources listed in its unit (brief criterion 4 names B review as the proof).
   - Catches: a page telling a beginner to run a command or set a setting that does not exist.
   - Size: seconds (scans), minutes (review). Rerun trigger: any edit to `docs/use/*.md`, or a change in a listed source before merge.

No new proof machinery is needed. No new test is planned: criteria 1, 2 and 4 are proven by the existing docs tests plus greps and B review, as the design allows ("no new tests beyond the test rows named here"). Criterion 3's only change is the planned test edit, already committed.

## Verification at implement end

1. Repo checks: format, test, typecheck as configured.
2. The greps and runs under criteria 1-4, cited in `implementation/report.md`.
3. Manual read of each page on GitHub-style Markdown preview, or plain read, confirming pictures render and every page ends with `Next:`.

## Limitations

- Review is the only proof that a page covers its map subject and that its prose matches the code. No mechanical check can judge that.
- Next-step chain ends at the command reference until docs-start or docs-use-finish link onward. This leaf may not link pages it does not own or depend on.

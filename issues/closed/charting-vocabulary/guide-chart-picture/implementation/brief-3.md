# Sub-brief 3: parts.html eight words + chart-line syncs

## 1. Goal

Define the eight chart words in `parts.html` and make the chart mentions in `create.html`, `files.html`, `in-practice.html`, `cheat.html` say the same thing in the same words, linking to `chart.html` where a reader needs more. Plan decisions D4 and D5.

## 2. Numbered acceptance criteria

1. `parts.html` words table gains eight rows immediately after the Leaf row, in this order: Territory, Map, Fog, Fork, Question, Round, Chart, Off route. Each row: the word, one or two short sentences from the definitions below, and a "Where it lives" cell.
   - Territory: the whole problem space for one destination. Where it lives: nowhere on disk — it is what the agent looks at.
   - Map: what the agent sees when it looks at the territory: forks, practitioner questions, beginner pitfalls. Drawn at open, redrawn after every answer, never saved as its own file.
   - Fog: a part of the map the agent can see but cannot yet phrase as a sharp question. One patch per bullet in `CHART.md`; clears into forks as answers land.
   - Fork: one topic where the route splits. One file per fork under `forks/`; a fork holds one or more questions that always travel together on one screen. A fork is taken when every material question in it is taken, and a taken fork is never reopened.
   - Question: one Q block inside a fork: explainer, evidence, exhaustive options with one recommended, pitfalls. An explicit choice takes it; a request for explanation does not.
   - Round: one screen put to you: every currently material question across all open forks, one reply key, one challenge check.
   - Chart: the one page per destination: forks taken, forks open, fog, off route. Lives at `issues/chart/<issue>/CHART.md`.
   - Off route: work deliberately left past the destination, with the reason. A section in `CHART.md`.
2. `parts.html` lede "Twelve words cover the whole system" becomes "Twenty words cover the whole system".
3. `create.html` rows at :58-59 keep their meaning but link `chart.html` where a reader needs the flow (e.g. "A chart of forks you take one by one" → link "chart" or "forks" to `chart.html`); wording stays consistent with the eight words.
4. `files.html:106` chart row links `chart.html` (e.g. "The chart" → `<a href="chart.html">chart</a>`), wording otherwise consistent.
5. `files.html` plan.md row gains the word "decisions": "The final plan. Settled decisions, read-first paths, ordered checklist, acceptance criteria." (or equivalent — the word must appear).
6. `in-practice.html:67` chart-issues sentence links `chart.html` where a reader needs the flow.
7. `cheat.html:64` `/chart-issues` line stays a command line; if a link fits the `<pre><code>` format without breaking alignment, add one, otherwise leave the command as the consistent mention.
8. `grep -rniE "decision|batch|not yet specified|out of scope|unspecified" docs/guide/` matches only the design.md row ("Locked decisions") and the plan.md row in `files.html`.
9. Touched prose keeps the beginner rules: short sentences, one idea per paragraph, terms used only after Parts defines them.

## 3. Read-first list

- `docs/guide/parts.html` — the words table (rows are `<tr><td>Word</td><td>…</td><td>where</td></tr>`)
- `docs/guide/create.html:55-65`, `files.html:95-110`, `in-practice.html:60-80`, `cheat.html:55-90`
- `/home/ivan/Work/infra/akrogon/issues/open/charting-vocabulary/rename-vocabulary/brief.md` — authoritative definitions (lines 8-15)
- `skills/chart-issues/assets/shapes.md` — on-disk names (`forks/`, CHART.md sections)
- This skill folder's `ponytail.md`

## 4. Change list and needed interfaces

- `parts.html`: eight `<tr>` rows after the Leaf row + lede word swap.
- `create.html`: two table rows gain a `chart.html` link.
- `files.html`: chart row link + plan.md row reword.
- `in-practice.html`: one sentence link.
- `cheat.html`: at most a comment/link tweak on the `/chart-issues` line.

## 5. Do-not, reasons and exceptions

- Do not add the nav link or renumber eyebrows — a sibling brief owns those edits on the same files; overlapping edits collide.
- Do not use the forbidden words in criterion 8 anywhere — a done-criterion greps the whole guide.
- Do not rewrite whole paragraphs or sections — only the named lines and rows; the design limits the beginner pass to these touches.
- Return a mismatch with evidence instead of changing scope; the exception is a revised brief from B.

Restated: only the named rows/lines; no forbidden words; no structural edits; mismatch over scope change.

## 6. Ordered steps

1. Add the eight rows and fix the lede in `parts.html` (criteria 1-2).
2. Sync the four pages' chart lines (criteria 3-7).
3. Self-check: run the criterion-8 grep and paste output; `grep -n "Territory\|Map\|Fog\|Fork\|Question\|Round\|Chart\|Off route" docs/guide/parts.html` shows the eight rows in order.

Advisory size: 5 files, under 20 turns.

## 7. Commands

`AKROGON_BASE=9ab80642f1411732a48acdd9302af4f49e9f972f bun test --changed="$AKROGON_BASE"` — expected to run no tests (HTML is invisible to it); that is fine, B runs the browser suite.

## 8. Done-when, evidence and report

Eight rows in place, lede updated, chart lines synced and linked, criterion-8 grep output pasted showing only the two files.html rows.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

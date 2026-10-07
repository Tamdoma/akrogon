# Brief 2: chart-issues skill and guide prose for the usage table

## 1. Goal

Teach the chart-issues door to write `seats.yaml`, count restatements, and run the usage script; list the two new chart records in shapes and the guide. Plan decisions D1, D2, D7, D9.

## 2. Acceptance criteria

1. `skills/chart-issues/SKILL.md` Open states: when the chart folder is created the door writes `<chart>/seats.yaml` holding the open time — the time the door began its first pass on this chart, before the opening map — and, for A and each named peer, the pane, harness kind and session id as `herdr agent list` prints them (`pane_id`, `agent`, `agent_session.value`). It adds an entry whenever a seat's session id changes, with a concrete stated trigger (e.g. each time it re-reads `herdr agent list` for a peer exchange or a chart write). Before the chart folder exists, the open time and seat entries stay with the door's temporary files; neither folder creation nor a replacement session resets the open time. Outside herdr the record holds the open time and no session, and the usage table then says usage unmeasured. The door asks the operator nothing new.
2. SKILL.md Take states: when the door records a fork's answer it adds to `restatements` in `seats.yaml` one for each restatement request it answered on that round, judged by meaning and with no word list; and the fork's Taken keeps the sentence saying how often the round was restated.
3. SKILL.md Handoff states: the door runs `bun <skill-folder>/scripts/chart-usage.ts <chart-folder> [<until>]` right before the handoff review and shows the printed lines there; it reports the outcome word and continues on `outcome partial` — a failed measurement never holds a handoff; it runs the script again when it appends `Handed off`, `Held` or `Closed`.
4. `skills/chart-issues/assets/shapes.md` chart records tree lists `seats.yaml` and `USAGE.md` with one line each, and defines the seats.yaml shape in its own `### seats.yaml` section placed before `### readiness.yaml`:

   ```yaml
   opened: '2026-10-06T16:34:47Z'
   restatements: 0
   seats:
     - seat: A
       pane: w8:pCT
       harness: claude
       session: 1ce71920-4c64-414b-ac1c-af56890a1c4b
   ```

   with a one-line note that a replaced session is a second entry with the same seat letter and that outside herdr `seats` is empty.
5. `docs/guide/chart.md` chart-records listing (~line 152, the `issues/chart/export-csv/` tree) gains `seats.yaml` and `USAGE.md`, and the page gains the stated limits: the window's tokens and minutes show that usage and elapsed time changed, not that dollar cost fell; a whole-session dollar total can include other charts and is not this chart's cost; subagent usage is not counted; how a turn and the operator wait are defined (a turn is one seat's work between two operator messages or a codex `task_started`→`task_complete`; operator wait is the sum of minutes from each operator message until that seat's reply ended).
6. `docs/guide/files.md` is read for the list of chart files; if it has one it is updated the same way, otherwise your report states none was found (it covers leaf artifacts only — verify, then likely report no hit).
7. No model name, effort level, price or rate literal appears in the edited files; the labels `seats.yaml`, `USAGE.md`, `first turn in window`, `operator turns`, `usage unmeasured`, `outcome partial` appear verbatim where the criteria name them.

## 3. Read-first list

- `skills/chart-issues/SKILL.md` — Open, Take, Handoff sections; match its dense sentence style, add to existing paragraphs rather than new sections where natural.
- `skills/chart-issues/assets/shapes.md` — Chart records tree and the `### readiness.yaml` section (a `### seats.yaml` section before it does not break `tests/chart-shapes.test.ts`, which locates the readiness heading first).
- `docs/guide/chart.md` — the chart records listing and surrounding prose.
- `docs/guide/files.md` — read only.
- `skills/chart-issues/assets/standing-design.md` — for the sibling-leaf note below.
- This skill's `ponytail.md`.

## 4. Change list and interfaces

Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. Reads: `docs/guide/files.md`. Wave 1, no dependencies.

Interfaces consumed (already fixed, do not re-derive): the script contract `bun <skill-folder>/scripts/chart-usage.ts <chart-folder> [<until>]` with `<skill-folder>` resolved to the loaded chart-issues skill directory; `outcome done|partial`, exit 0 unless the chart folder is missing or `seats.yaml` absent/unparseable; `USAGE.md` line 1 is the summary line read for sibling charts.

## 5. Do-not

- Do not edit `chart-usage.ts`, tests, fixtures, `src/`, `issues/` or `docs/guide/files.md` — U1 owns the script; files.md is read-only for this leaf unless it holds a chart-files list (it does not, verify).
- Do not rewrite or reorder existing SKILL.md sentences — insert the new rules; the sibling leaf peer-notes-single-writing edits other sentences of this file on its own branch, so a minimal diff avoids its merge pain.
- Do not invent a new env var, config key, credential or operator question — the door asks the operator nothing new.
- Do not state dollars, prices, rates or model names anywhere.
- A conflicting requirement → return a mismatch with evidence to A. Exception: a revised brief from A.

Reasons restated: disjoint ownership with U1, sibling-leaf overlap on SKILL.md, criterion 1's "nothing new", criterion 4's no-literals rule. Exceptions restated: only a revised brief from A changes scope.

## 6. Ordered steps

1. SKILL.md: Open gains the seats.yaml rules (criterion 1); Take gains the restatements + Taken-sentence rules (criterion 2); Handoff gains the run/report/marker rules (criterion 3).
2. shapes.md: tree lines + `### seats.yaml` section (criterion 4).
3. docs/guide/chart.md: tree lines + stated-limit sentences (criterion 5).
4. Read docs/guide/files.md; update or report no hit (criterion 6).
5. Run the commands in section 7.
6. Advisory size: 3 files, under 20 turns.

## 7. Commands

```bash
AKROGON_BASE=3ce20853c64d843d97a1ebe0fbef335958ac0dff
bun install   # once, in your worktree
: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000
# if that run did not execute tests/chart-shapes.test.ts or tests/docs-links.test.ts:
bun test tests/chart-shapes.test.ts tests/docs-links.test.ts --timeout=30000
```

## 8. Done-when, evidence and report

All criteria met; `tests/chart-shapes.test.ts` still green; commit your chunk with message `docs: chart usage records in skill and guide` (or similar). Report the commit id and paste results.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Plan: live-proof-line

Text-only leaf: two rules in the chart door across four files. No command code, no new tests (design locks no vanity tests); proof is diff review plus the existing blocking `checks`.

## Decisions

- D1 — Review line lives in `skills/chart-issues/SKILL.md` `## Handoff`, one sentence beside the chart-usage sentence in the section's first paragraph. It tells the door to show, as door prose (not chart-usage script output), one line per leaf whose done-criteria need a live run: session count, how many run at once (rounds counted), estimated elapsed time, worst case if sessions hit their timeout. Labelled an estimate. Timeout basis is the destination's session timeout named by file and value; a recorded measured case replaces that basis; "unknown" with a reason is allowed when no basis exists, and a missing basis is not a failed measurement. Information only: it never times out a leaf and never waives a criterion; the operator approves or narrows scope.
- D2 — Side-by-side rule lives in `skills/chart-issues/assets/standing-design.md`, folded into the live-run lines (the cheapest-test line and the "slow or live-run leaf" line are the placement anchor). As part of every live-run done-criterion: sessions run side by side, each with its own working root and log, unless the brief names the shared resource that forces serial; a seat that finds an unnamed shared resource holds a criterion that cannot pass within the leaf and ends the pass `failed` through the existing red-criterion exit (implement-issue SKILL.md).
- D3 — Refusals live in `skills/chart-issues/assets/shapes.md` `## Preflight and validation`, added to the existing audit refusal list in the implementer-read paragraph: refuse a live-run done-criterion that runs sessions one after another without naming the shared resource; refuse a live-run done-criterion that names a session count; the existing test-count refusal is kept unchanged.
- D4 — `docs/guide/chart.md` gains one describing sentence in the handoff review paragraph (the "Before handoff the door also checks..." area): the review shows an informational estimate line for each leaf with live-run proof so the operator sees expected elapsed cost before dispatch. The guide describes the line and its purpose; it does not restate the rules.
- D5 — No new number, budget, timer or duration gate. No numeral characters in added lines; the brief's own phrasing ("one line per leaf", session-count and elapsed-time field names) carries the quantities as field descriptions, never constants or enforcement. `timeout` appears only as the named basis field D1 requires. The D3 refusals and the existing `failed` exit are the criterion's allowed exceptions.
- D6 — One worker writes all four files. The same concepts (live-run line fields, side-by-side rule, refusals) must read consistently across files, so a split gains nothing over one coherent wording pass.

## Read-first

- `/home/ivan/Work/infra/akrogon/issues/open/proof-cost/live-proof-line/brief.md` — done-criteria wording.
- `/home/ivan/Work/infra/akrogon/issues/open/proof-cost/live-proof-line/design.md` — verbatim binding decisions and placement exclusions.
- `skills/chart-issues/SKILL.md` — `## Handoff` section, especially the chart-usage sentence.
- `skills/chart-issues/assets/standing-design.md` — the cheapest-test and "slow or live-run leaf" lines.
- `skills/chart-issues/assets/shapes.md` — the audit refusal list in `## Preflight and validation`.
- `docs/guide/chart.md` — the handoff review description around "Before handoff the door also checks...".
- `skills/implement-issue/SKILL.md` — the existing red-criterion `failed` exit the rule references.

## Interfaces

None. No new files, commands, scripts or state fields.

## Waves

### Wave 1

- U1 — Edits all four owned files per D1–D5.
  - Owns: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/standing-design.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`.
  - Shared test resources: none. Prerequisites: none.

## Done-criteria → proof

| # | Criterion | Proof command | Failure caught | Size | Rerun trigger |
|---|-----------|---------------|----------------|------|----------------|
| 1 | SKILL.md `## Handoff` rule, all fields | `git diff "$AKROGON_BASE" -- skills/chart-issues/SKILL.md` then read the `## Handoff` section; `grep -n "estimate\|timeout\|session" skills/chart-issues/SKILL.md` | Missing field (count, concurrency, estimate, worst case, basis rules, information-only), text placed outside `## Handoff`, or line framed as chart-usage output | seconds | Any edit to the file |
| 2 | standing-design.md side-by-side rule | `git diff "$AKROGON_BASE" -- skills/chart-issues/assets/standing-design.md` then read the live-run lines; `grep -n "side by side\|shared resource\|failed" skills/chart-issues/assets/standing-design.md` | Missing side-by-side requirement, missing named-resource exception, or missing `failed`-exit consequence | seconds | Any edit to the file |
| 3 | shapes.md audit refusals | `git diff "$AKROGON_BASE" -- skills/chart-issues/assets/shapes.md` then read the implementer-audit paragraph; `grep -n "session\|test count\|one after another\|serial" skills/chart-issues/assets/shapes.md` | Missing serial-without-resource refusal, missing session-count refusal, or a dropped/weakened test-count refusal | seconds | Any edit to the file |
| 4 | chart.md describes the line | `git diff "$AKROGON_BASE" -- docs/guide/chart.md` then read the handoff review paragraph; `grep -n "live\|estimate" docs/guide/chart.md` | Missing description, or a restated rule instead of a description | seconds | Any edit to the file |
| 5 | No new number/budget/timer/duration gate | `git diff "$AKROGON_BASE" -- skills/chart-issues/SKILL.md skills/chart-issues/assets/standing-design.md skills/chart-issues/assets/shapes.md docs/guide/chart.md \| grep -E "^\+" \| grep -nE "[0-9]\|budget\|timer\|duration\|deadline\|cap on\|limit"` — every hit reviewed; hits allowed only as D3/D5 exceptions | A literal numeral, budget, timer or duration gate in added text | seconds | Any edit to the four files |

Blocking `checks` that must pass after the edit (`akrogon config`): `bun run format`, `bun test --timeout=30000`, `bun run typecheck`. The relevant tests are `tests/docs-links.test.ts` (guide links/anchors) and `tests/chart-shapes.test.ts` (parses the `### readiness.yaml` block — untouched). Size: minutes. Rerun trigger: any edit. Format lesson (2026-10-08): `bun run format` rewrites pre-existing prettier drift in untouched files — revert any hunk outside the four owned files.

## Docs

Affected agent/human docs: the four owned files above — each edited per D1–D4. No `AREA.md`, `README.md` or other guide page needs a change; the edit adds prose inside existing sections only.

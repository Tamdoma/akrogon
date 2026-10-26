# Plan: new-chart-proposal

Prose-only leaf. Three files carry the new-chart proposal rule: `skills/chart-issues/SKILL.md` `## Autopilot`, `skills/chart-issues/assets/shapes.md` `## Autopilot` line list, `docs/use/autopilot.md`. No code, no new tests, no live run, no grants, no secrets (readiness.yaml has all sections empty; `akrogon status new-chart-proposal` shows no `Missing:` lines).

## Read first

- `issues/open/autopilot-new-chart/new-chart-proposal/brief.md` and `design.md` — locked criteria and binding decisions.
- `issues/chart/autopilot-new-chart/CHART.md` and `forks/{hold-proposal,no,cross-repo}.md` — operator answers and A picks this leaf transcribes.
- `skills/chart-issues/SKILL.md` `## Autopilot` — target section; holds the wait list ("These make that chart wait…"), the handed-list bound ("The door never … extends the handed list…") and Drain-under-autopilot scope.
- `skills/chart-issues/assets/shapes.md` `## Autopilot` line list — `- wait:` and `- pending step:` lines beside the target.
- `docs/use/autopilot.md` — "What still waits for you" and "Read the record".
- `learnings/LESSONS.md` — 2026-10-01 explanatory-prose lesson: no wording assertions, per design interpretation.
- `skills/chart-issues/assets/standing-design.md` — test rules the design interprets for prose leaves.

## Decisions

- D1. New prose goes into `## Autopilot` in SKILL.md, not Drain. Drain keeps its "Write one chart folder per destination" sentence; precedence over it is stated inside `## Autopilot` where the handed-list bound already lives.
- D2. Placement: the new-chart proposal rule is one new paragraph inside `## Autopilot`, placed immediately after the paragraph starting "These make that chart wait while the door moves on within its handed list" (line ~139). The proposal joins that wait list by adding it to the item list there (criteria 2), and the new paragraph carries its mechanics: trigger/precedence (criterion 1), parking rules (criterion 2), the answer paths (criterion 3) and the cross-repo form (criterion 4). A separate paragraph keeps the wait-list sentence readable; one paragraph keeps each fact stated once.
- D3. The wait-list item names the proposal as an operator approval that is not a grant, in the same clause as the other waits. "Approval" is the only category stated; existing spans/handover sentences covering "approval, need or prerequisite" then apply without change (forks/hold-proposal.md, C F2).
- D4. Trigger sentence conditions, all from forks/hold-proposal.md: found work is its own destination (its own observable outcome); the handed chart cannot hand off without it; no existing open leaf or chart covers it, judged with the research the chart already did (no extra scan mandated). Guardrails in the same paragraph: unneeded work stays `recorded only`; a same-outcome dependency stays a prerequisite leaf; splitting expressly handed intake at the map stays A's; under autopilot the handed list wins over one chart folder per destination.
- D5. Existing-open-chart branch in the same paragraph: write no proposal; the `wait:` line names that chart; the chart resumes once that chart's leaves are written, then follows the yes-path ordering (`blocked-by` same-repo, else the cross-repo wait); when that chart is on the handed list and runnable, A takes it next, otherwise A moves to another runnable handed chart.
- D6. Parking mechanics: A parks as soon as the proposal can be stated, with findings recorded, and takes no further fork; nothing is created for the proposed chart before a yes (no folder, seed or file); the waiting chart's Destination does not change while it waits; consultant agreement never answers the proposal.
- D7. The answer: the proposal's question is fixed in form, "chart <X> on its own (yes) or bring it into <waiting chart> (no)?". Yes: operator's words add <X> to the handed list, recorded as a `changed list` mode entry; A charts <X> in the same run, handover as usual; the waiting chart resumes after <X>'s leaves are written, handing off with `blocked-by` on them when the dependent leaf shares their destination repo. No: A resumes the waiting chart with the found work in scope as forks or prerequisite leaves, rewrites the Destination under that answer and records the no verbatim. Any other operator words stay a valid answer.
- D8. Cross-repo: when the waiting chart's dependent leaf's destination repo differs from <X>'s leaves', after <X> is handed off the waiting chart stays unhanded with one `wait:` line naming every needed <repo>/<leaf> and its landed check (each named leaf folder under that repo's `issues/closed/`); the operator's next message in the door resumes it; no cross-repo `blocked-by`, no timer. Comparison is against the dependent leaf's destination repo (forks/cross-repo.md correction), not the chart folder's repo.
- D9. shapes.md: one new line `- proposal: <proposed destination, its goal, the criterion that cannot pass without it, the waiting chart and the fixed question>` in the `## Autopilot` line list, placed beside `- wait:`. One line per proposed destination is stated in the line description.
- D10. autopilot.md: one new bullet in "What still waits for you" naming a needed new chart in the guide's plain voice with the yes and no effects; one mention of the proposal line in "Read the record" (the section's existing item list gains "proposals" or a clause covering them). No other guide page is touched.
- D11. No tests are added: design interpretation — no done-criterion is a code behavior, and the 2026-10-01 lesson bars wording-coupled assertions. Proof is the diff read against the criteria plus existing `checks` (format, test, typecheck); `tests/docs-links.test.ts` already guards the links this leaf may add inside `docs/`.
- D12. Brief/design consistency: none found — brief and design agree on all seven criteria; nothing to record as a design-over-brief note.

## File/criterion checklist

One wave, one unit: three small prose edits to one section family, all carrying the same locked text; splitting them across workers gains nothing and the three files state different projections of one rule. Serial-solo run: every wave holds one unit, so A implements per implement-issue's serial-solo rule — no workers, no sub-briefs.

- W1/U1 owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/shapes.md`, `docs/use/autopilot.md`. No shared test resource. Criterion coverage: 1–7.

## Doc checklist (every affected agent and human doc)

- `skills/chart-issues/SKILL.md` — agent doc: `## Autopilot` wait list gains the proposal item; new paragraph after it carries trigger, answer and cross-repo rules.
- `skills/chart-issues/assets/shapes.md` — agent doc: `## Autopilot` line list gains `- proposal:`.
- `docs/use/autopilot.md` — human doc: new wait bullet; `proposal` added to the record-reading list.
- `skills/chart-issues/assets/questions.md` — not affected: its approvals-stay-operator-only exception already covers the answer (design exclusion, B,C).
- `docs/use/run-work.md`, other `docs/` pages — not affected: no other page states the chart wait list (grep confirmed).
- `src/`, `tests/` — not affected: `src/status.ts lastStage` reads only `Handed off`/`Closed`/`Held` markers; a `- proposal:` line is a `- ` item and cannot parse as a marker; `tests/chart-shapes.test.ts` parses only the readiness.yaml example.

## Criterion proof map

Executable boundary: none — every criterion is prose in an agent-read or human-read file. The real consumer is the chart-door agent that loads the skill and the operator who reads the guide; a wording or placement violation has no runnable case and is caught by review reading the diff against the criterion text. Verified also by the destination `checks`: `format` (prettier over the edited files), `typecheck`, and `bun test tests/docs-links.test.ts` for links added under `docs/`. `full`/merge-time `test` runs under `akrogon verify`; this plan adds no whole-suite requirement the brief does not name.

Per-criterion condition trace (decisions vs what each criterion requires to stay stated):

- Criterion 1 (trigger and precedence, SKILL.md). Decisions D2, D4, D5. Conditions that could silently drop: the three trigger conditions, the "recorded only"/prerequisite-leaf/map-split guardrails, the existing-chart branch with its resume and next-take ordering, and the handed-list precedence. Traced reason each cannot break without the diff showing it: each condition is one clause of the locked text in forks/hold-proposal.md; the implementer copies it into one paragraph, and review reads the paragraph against the criterion. No runnable case: the state lives in prose.
- Criterion 2 (the wait, SKILL.md). Decisions D2, D3, D6. Conditions: proposal named among waits as a non-grant approval; park as soon as statable with findings recorded and no further fork; nothing created before yes; Destination unchanged while waiting; consultant agreement never answers. Each is a clause of the same paragraph and the wait list; review reads it against the criterion.
- Criterion 3 (the answer, SKILL.md). Decision D7. Conditions: fixed question verbatim; yes path (`changed list` entry, same-run charting, resume after leaves, `blocked-by` when same repo); no path (resume, scope as forks/prerequisite leaves, Destination rewrite, verbatim no recorded); other words stay valid. All clauses of the same paragraph; review reads it against the criterion.
- Criterion 4 (cross-repo, SKILL.md). Decision D8. Conditions: compare against the dependent leaf's destination repo; single `wait:` line naming every `<repo>/<leaf>` with the `issues/closed/` landed check; resume on the operator's next message; no cross-repo `blocked-by`, no timer. Review reads the paragraph's cross-repo sentences against the criterion.
- Criterion 5 (record, shapes.md). Decision D9. Conditions: `- proposal:` line shape holding all five fields (proposed destination, goal, criterion that cannot pass, waiting chart, fixed question); one line per proposed destination; beside `wait:`. Review reads the line spec against the criterion; `- ` list form keeps `src/status.ts lastStage` unparsable-as-marker by construction (existing invariant).
- Criterion 6 (guide, autopilot.md). Decision D10. Conditions: plain-words bullet under "What still waits for you" with yes and no effects; proposal mentioned in "Read the record". Review reads the two edits against the criterion; `tests/docs-links.test.ts` covers any link the bullet adds.
- Criterion 7 (diff scope). Observation: `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` lists only the three files. Boundary: git on the leaf branch. Command run at implementation end through `akrogon run-check --name 'diff-scope' -- git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` (read output; no artifact-only proof — it observes the result directly). Size: seconds. Rerun trigger: any edit outside the three files.

Proof commands (all runners exist at `AKROGON_BASE`):

- `akrogon run-check --name 'docs-links' -- bun test tests/docs-links.test.ts` — seconds; rerun on any link or heading change in `docs/`.
- `format`, `typecheck`, `test` — the repo's configured `checks` commands via `akrogon verify` at handoff; seconds to minutes.
- `akrogon run-check --name 'diff-scope' -- git --no-pager diff --name-only "$AKROGON_BASE"...HEAD` — criterion 7.

Human-only blockers: none. Open limitations: none — the chart's Off route items (no markers, queues, code, attended behavior, timers) stay outside and are preserved unchanged.

## Implementation notes

2026-10-28: the worktree needed the configured setup (`bun install --frozen-lockfile`, per `akrogon config` `setup`) before `bun test` could run; the first `docs-links` run failed only on missing `zod`. Refines no decision; recorded so later proofs read as real.

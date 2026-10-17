# Plan: autopilot-mode

Direct synthesis by A for `debate: "no"`. No positions or rebuttals exist; the locked design governs scope. This leaf edits four text files: `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. Done-criterion 10 caps the branch diff at those four paths, and the design states no test asserts skill prose wording. No new or changed test file can exist in this diff, so this plan commits no tests: every criterion is proven by an existing `checks` command, an existing test file, or a one-off verification command recorded in the report.

## Read first

Paths relative to the worktree unless marked authoritative.

- Authoritative `issues/open/autopilot/autopilot-mode/brief.md` and `design.md` under `/home/ivan/Work/infra/akrogon`: scope, binding decisions verbatim, fork answers, shared-lines note with leaf any-consultants.
- `skills/chart-issues/SKILL.md`: owned file; Open, Drain, Take, Handoff, Direct route sections the Autopilot section modifies.
- `skills/chart-issues/assets/questions.md`: the "Recommendations and silence cannot supply an operator answer" sentence and the peer-outcome lines ("reported to the operator", "ends its turn") that gain the autopilot exception.
- `skills/chart-issues/assets/shapes.md`: CHART.md code block (mode record and `## Autopilot` shape), the fork `## Taken` rule and the preflight "lacks an operator answer" refusal.
- `docs/guide/chart.md`: gains one `## Autopilot` section; existing link style is `[chart-issues](../../skills/chart-issues/SKILL.md#direct-route)`.
- `src/status.ts` `lastStage`: parses `^(Handed off|Closed|Held)\b` at line start, last match wins. Consumer that forces every mode-record and Autopilot-section line to be a list item.
- `skills/chart-issues/scripts/chart-usage.ts`, `peer-ask.ts`, `peer-wait.ts`: unchanged consumers; the autopilot rules reference their existing outcome words (`failure`, `blocked`, `budget` + status + `signal`) and `agent_session.value`.
- `tests/chart-shapes.test.ts` and `tests/docs-links.test.ts`: existing gates. The first parses the `### readiness.yaml` fenced block in shapes.md — edits must not touch that block. The second checks every markdown link and `#anchor` in SKILL.md and all guide files — a `[..](.../SKILL.md#autopilot)` link only passes once `## Autopilot` exists.
- `docs/reference-index.md`, `skills/AREA.md`, `learnings/LESSONS.md`: read at planning. Relevant lessons: `2026-09-11-stale-rule-in-docs` (grep `docs/` and skills for every changed rule's old wording), `2026-09-11-lock-vs-criterion` (a verbatim standing sentence like "Recommendations and silence cannot supply an operator answer" must stay with its exception added, not be rewritten away), `2026-10-01-failed-stop-guard-wording` (why criteria are proven by refusal/state/structure, not wording assertions).

## Decisions

### D1. One `## Autopilot` section in SKILL.md, placed after `## Direct route` and before `## Printed footer`

All autopilot rules live in one section so the attended flow reads first and the mode is a deviation layer on it. The section is organized by the brief's own order: switch-on, answering, waits and limits, route, scope, consultants, off and resume, record. It names the operator's values verbatim: simplicity, function over form, removing over adding, systems thinking, speed and price. It states autopilot needs herdr: outside herdr the door says autopilot cannot start.

- Switch-on: only the operator's words in the door's own pane turn it on, at door start or later naming a chart; the words carry the mode, the handed work and the consultants or none. The first reply echoes all three and says handed-off work waits for the operator's watcher, which the door cannot check. After the door reads the handed work it shows a best-guess list of things to supply (logins, API keys, files), each with purpose and destination and no approvals on it. The operator's words go verbatim into each handed chart's INTAKE.md; a mode line with time, door pane and A's `agent_session.value` goes into CHART.md. Operator answers given before a mid-chart switch-on stay the operator's.
- Answering: every step of the attended process still runs. At each point where the operator would answer (fork rounds, split proposal, handoff review including debate and seats) A writes the full round in its pane, then picks by the evidence and those values, recording the pick in the fork's Taken as A's with reason, rejected options and standing consultant dissent, never as operator words.
- Waits and limits: grant approval, fixture retention, secret-save approval, a mutating proof call before its grant approval (read-only proofs proceed), a missing need and a human-only prerequisite each make that chart wait while the door moves on within its handed list. A step on main or a lesson write that would change autopilot's own switch or limits waits for the operator. The door never turns autopilot on, extends the handed list, changes the consultants or raises an existing bound in the skill.
- Route: lifecycle only; direct is never offered under autopilot.
- Scope: Drain takes only the handed list — no oldest-chart or seed steps, no new imports. A full match between a destination seed and handed work is A's to confirm; other seed matches, open-time close offers for skipped identities, and flaky tests or failed leaves outside the list are recorded only. Handed work is held when another door's open chart (see I4) shares its chart folder, GitHub identity or legacy path, or shows the same outcome in Destination. Two doors started on the same work at the same moment is a stated limit. A failed leaf the operator hands over is charted like other handed work.
- Consultants: a consultant is dropped for the session, never re-prompted, completed returns kept, when its exchange ends `failure` or `blocked`, when herdr refuses its prompt, or when `budget` with status idle/done and `signal: unproven` repeats after one more full wait. A late return file is ignored and recorded. Working-status budgets rerun at once. A's own mistaken call is repaired without dropping anyone. A consultant whose pane is the latest A seat of another door's open chart is skipped the same way; the door's own charts never skip. Losses name when and which charts ran without it.
- Off and resume: the mode ends when every handed chart's last marker is `Handed off` or `Closed`; a waiting chart keeps it on across a pass end and the operator's next message resumes it. Only the operator's words in the door pane turn it off early; supplying a key or changing the handed list keeps it on, and every mode change is appended to the mode record with its time. The latest entry governs: same session id (compaction) continues, a different id starts attended until "continue autopilot" resumes the same handed list with lost consultants still lost. Once off, an open peer turn is collected first and the next question goes to the operator.
- Record: CHART.md gains the mode record and `## Autopilot` section per the shapes.md shape (D4). The pass ends with one line per chart in the door pane. The handoff footer says "handed off", not "started", and names a pause when `akrogon status` shows one. Nothing computes a score.

### D2. Minimal pointer edits elsewhere in SKILL.md — one line each

- Dependency line: "This is an attended door, not a lifecycle phase" becomes attended **by default**, pointing to `## Autopilot` for the operator-switched mode. Front matter "Operator-invoked only" stays — only the operator switches it on.
- Open first-reply rule: under autopilot the first reply follows `## Autopilot` (echo + best-guess needs list) instead of the attended naming.
- Handoff review: under autopilot A answers the review itself per `## Autopilot`.
- Direct route offer: under autopilot the direct route is never offered and the review shows no route question.
- Drain: under autopilot the drain takes only the handed list per `## Autopilot`.

### D3. questions.md gets two exception sentences, not a rewrite

- After "Recommendations and silence cannot supply an operator answer." add the one exception: under autopilot, per the Autopilot section, A's own recorded answer counts. Keep the standing sentence verbatim (lock-vs-criterion lesson).
- In the peer-exchange paragraph, the outcomes that today are "reported to the operator" and "ends its turn" (`failure`, `blocked`, non-zero exit, `budget` idle/done + `signal: unproven`) gain a pointer: under autopilot they follow the consultant rules in `## Autopilot` instead.

### D4. shapes.md gets the record shape plus two acceptance edits

- The CHART.md code block gains, after `## Pending steps` and before `## Direct attempt`, a `## Autopilot` section whose comment states it is written only under autopilot and every record line is a `- ` list item so no line parses as a chart marker. First items: the mode record, one `- mode` line per mode change with time, door pane and A's session id. Then, in the brief's order: boundary breaches first; switch-on reference; consultants with each loss's reason and the charts run without it, plus ignored late returns; the route with its debate choice; handed-off leaves; completed steps on main and lesson writes for handed work; waits with the exact missing need, approval or prerequisite and the next step; pending steps on main as `after <leaf> lands, open a chart door to finish <step>`; picks against the round's recommendation; recorded-only seeds and candidates; friction; linked usage lines. The section records observed states only, never "started" or "merged" without evidence.
- Fork shape `## Taken`: under autopilot it holds A's pick with reason, rejected options and standing consultant dissent, labelled as A's under autopilot — never operator words.
- Preflight: the "Refuse the handoff while any fork file lacks an operator answer" refusal accepts an A answer recorded under autopilot. Approvals (grant, fixture retention, secret-save) stay operator-only — no preflight or shape text moves them to A.
- The `### readiness.yaml` fenced example is not touched (chart-shapes.test.ts parses it).

### D5. docs/guide/chart.md gets one `## Autopilot` section after `## Direct route`

Operator-facing, matching the guide's plain register: how to switch it on (words in the door pane naming mode, handed work, consultants or none) and off; what still waits for the operator (approvals, mutating proofs, missing needs, human prerequisites, changes to autopilot's own rules); where to read the record (the chart's `## Autopilot` section and the pass-end lines); the stated cost that a wrong pick can merge to main — and for akrogon, deploy — before the record is read; do not hand the same work to two doors; the first run happens once with the operator around, answering nothing and able to say stop. Link `[chart-issues](../../skills/chart-issues/SKILL.md#autopilot)` in the existing guide style, which makes docs-links.test.ts prove the anchor exists. The nav footer line is unchanged.

### D6. Marker-safety is enforced twice

The template comment in D4 states the rule; implementation also runs the one-off awk check under V2 proving every content line inside the template's `## Autopilot` section starts with `- `. This guards the `lastStage` consumer: a record line beginning `Handed off` would end the chart early. The door's own writes inherit the constraint because the rule lives in the shape the door copies.

### D7. Shared-lines stance with leaf any-consultants

That leaf edits SKILL.md Open and questions.md in parallel. Keep this leaf's edits localized to the named sentences and the one new section so the second merger rebases cleanly and keeps both outcomes. No change to `seats.yaml`, peer-ask.ts, peer-wait.ts, chart-usage.ts, `src/` or `tests/`.

## Interfaces

- I1. Anchor `autopilot`: heading `## Autopilot` in SKILL.md slugifies to `autopilot` under tests/docs-links.test.ts `slugify`. The guide link `#autopilot` resolves against it. Asset files (questions.md, shapes.md) are not link-checked; their pointers name `## Autopilot` in prose.
- I2. `src/status.ts` `lastStage`: `^(Handed off|Closed|Held)\b`, last match wins. Every mode-record and Autopilot-section line starts `- `; only real end markers start with those words.
- I3. `herdr agent list` `agent_session.value`: the same value seats.yaml stores; the door compares it to the latest mode entry for the compaction/replacement decision.
- I4. "Another door's open chart": a chart under the registered root's `issues/chart/` whose last marker is not `Handed off`, `Closed` or `Held` and whose latest A seat in `seats.yaml` sits on a different pane. Detection only, no lock.

## Acceptance criteria and proof

Each criterion names the real boundary (the file the door agent reads), state before/after, the product failure it catches, the command, size and rerun trigger. Extraction commands print the new/edited text; the agent reading the printout judges the prose against the binding decisions — for a prose product the agent read of the emitted text is the smallest real boundary, since the consumer is an agent following those sentences. There are no unit tests for prose and criterion 10 forbids adding any.

- C1 (brief 1, Switch-on): `SKILL.md` gains `## Autopilot` whose switch-on rules cover herdr-only start, echo, watcher line, needs list, verbatim INTAKE/mode-line record and pre-existing operator answers; the Open first-reply rule points to it. Before: no autopilot text. After: rules present. Catches: a door unable to start or record autopilot, or starting it outside herdr. Command: `sed -n '/^## Autopilot/,/^## Printed footer/p' skills/chart-issues/SKILL.md`. Seconds. Rerun on any SKILL.md change.
- C2 (brief 2, Answering): `## Autopilot` answering rules plus the questions.md exception and the shapes.md Taken/preflight acceptance. Before: silence cannot answer and forks refuse non-operator Taken. After: A's recorded pick counts, approvals stay operator-only. Catches: a door refusing its own chart's handoff or fabricating operator words. Command: same sed plus `grep -n 'Recommendations and silence' -A3 skills/chart-issues/assets/questions.md` and `grep -n 'operator answer' skills/chart-issues/assets/shapes.md`. Seconds.
- C3 (brief 3, Waits and limits): the waits/limits rules exist in `## Autopilot`, including the self-modification hold and the never-self-switch line. Catches: a door pausing the whole pass on one waiting chart, or widening its own authority. Command: sed of `## Autopilot` (same extraction). Seconds.
- C4 (brief 4, Route): `## Autopilot` states lifecycle-only and the Direct route offer points to it. Catches: an autopilot chart taking the direct route. Command: sed of `## Autopilot` and `## Direct route`. Seconds.
- C5 (brief 5, Scope): `## Autopilot` scope rules cover Drain-limited-to-handed-list, seed/candidate record-only classes, overlap holds and the simultaneous-start limit. Catches: an autopilot door draining seeds or double-working another door's chart. Command: sed of `## Autopilot` plus `grep -n 'Drain' skills/chart-issues/SKILL.md` for the pointer. Seconds.
- C6 (brief 6, Consultants): `## Autopilot` consultant-drop rules and the questions.md peer-outcome pointer. Catches: re-prompting a dead peer, hanging on an unproven idle budget, or skipping a consultant over its own chart. Command: sed plus `grep -n 'budget\|failure\|blocked' skills/chart-issues/assets/questions.md`. Seconds.
- C7 (brief 7, Off and resume): `## Autopilot` mode-end/resume rules including the mode record's latest-entry governs, compaction continuation and "continue autopilot" for a different session id. Catches: the mode silently dropping after a pass end or a replacement session silently resuming. Command: sed of `## Autopilot`. Seconds.
- C8 (brief 8, Record): the shapes.md CHART.md block holds the mode record and `## Autopilot` section in the locked item order, every record line a `- ` item; SKILL.md's record rules cover the pass-end line and the "handed off" footer wording. Before: no record shape. After: a door can write it without breaking `lastStage`. Catches: early chart-ending record lines and missing sections. Command: `awk` extraction below plus `tests/chart-shapes.test.ts` green. Seconds.
- C9 (brief 9, guide): `docs/guide/chart.md` `## Autopilot` section covers the six required explanations and the `#autopilot` link resolves. Catches: operator unable to run or misreading the mode's cost. Command: `sed -n '/^## Autopilot/,/^## /p' docs/guide/chart.md` plus `bun test tests/docs-links.test.ts`. Seconds–minutes.
- C10 (brief 10, diff scope): `git --no-pager diff --name-only "$AKROGON_BASE"...HEAD | sort` equals exactly the four paths sorted. Before: no diff. After: only owned files. Catches: scope creep, an accidental test file, an `issues/` write. Seconds. Rerun before every commit and at handoff.

Gate: the configured `checks` commands (format, test, typecheck) pass via `akrogon run-check`/`akrogon verify` at verification; they are the existing gate, not new proof machinery.

## Checklist — wave 1 (single unit, serial-solo)

- [ ] U1 — owns `skills/chart-issues/SKILL.md`, `skills/chart-issues/assets/questions.md`, `skills/chart-issues/assets/shapes.md`, `docs/guide/chart.md`. Implement D1–D7: add `## Autopilot` to SKILL.md; apply the one-line pointer edits; add the two questions.md exception sentences; add the CHART.md record shape and the two acceptance edits to shapes.md; add the guide section with its `#autopilot` link. During implementation, grep the three skill files and the guide for `operator answer`, `attended`, `reported to the operator`, `ask the operator`, `ends its turn` and audit every hit for a needed pointer (R2). No prerequisites; no shared test resource; no other unit. Every wave holding exactly one unit makes this a serial-solo run: A implements the plan itself, no workers.

Affected docs checklist: the four owned files are the deliverable; no other agent or human doc is affected (skill front matter, `skills/AREA.md`, README and other guide pages carry no chart-mode text).

## Concrete verification

Run in the worktree; record command, exit code and cited output in `implementation/report.md` via `akrogon run-check` for kept output.

```sh
# V1 — C1–C7 extraction read (seconds)
sed -n '/^## Autopilot/,/^## Printed footer/p' skills/chart-issues/SKILL.md
grep -n 'Recommendations and silence' -A3 skills/chart-issues/assets/questions.md
grep -n 'operator answer' skills/chart-issues/assets/shapes.md
grep -n 'budget\|failure\|blocked' skills/chart-issues/assets/questions.md

# V2 — C8 marker safety (seconds): the CHART.md block must contain
# ## Autopilot, and every content line under it until the next ## heading
# or the closing fence must be a list item
awk '/^# Chart:/&&!s{s=1;i=1} i&&/^## Autopilot/{f=1;r=1;next} r&&/^## /{r=0} r&&/^```/{r=0;i=0} r&&NF&&$0!~/^- /{b=1;print} END{if(!f){print "shapes.md: CHART.md block missing ## Autopilot";exit 1} exit b}' skills/chart-issues/assets/shapes.md

# V3 — C9 guide section (seconds)
sed -n '/^## Autopilot/,/^## /p' docs/guide/chart.md

# V4 — existing gates (minutes)
akrogon run-check --name 'chart-shapes' -- bun test tests/chart-shapes.test.ts tests/docs-links.test.ts

# V5 — C10 diff scope (seconds)
git --no-pager diff --name-only "$AKROGON_BASE"...HEAD | sort

# V6 — full gate at handoff (minutes)
akrogon verify
```

## Risks

- R1. A record or template line starting `Handed off`, `Closed` or `Held` ends the chart early under `lastStage`. Covered by the D4 template rule, the D6 awk check and the C8 proof.
- R2. A missed contradicting sentence elsewhere in the four files makes the door refuse or double-answer. Covered by the grep audit in U1 and the stale-rule lesson.
- R3. Parallel leaf any-consultants touches the same Open/questions.md lines; D7 keeps edits localized and the second merger rebases keeping both.
- R4. `sed`/`awk` ranges print an empty result when the section is absent — an empty extraction is a red signal, not a pass; each proof requires the operator-read text to exist. The V2 awk check exits 1 when `## Autopilot` is absent (recorded red before implementation: `check autopilot-record-shape: 1`, run 75e1f9be, log `implementation/check-autopilot-record-shape-1792223220029-926928.log`).

# Design: run-count-rule

## Binding decisions, verbatim

### signposts (issues/chart/round-drawings/forks/signposts.md)

Question:

1. Rule or check: when a fix could be skill text the agent must follow, or the akrogon command itself refusing, which do we pick?
   - 1a (recommended, A,C) The command refuses when it already holds the data to check (run counts, recorded fields). Skill text keeps only what needs judgment.
   - 1b The command shows the problem, and the agent or you decide.
   - 1c Skill text only. The agent counts for itself.
   - Steers: #126 (a counted run limit vs prose), #127 (a handoff step that refuses vs a paragraph), #125 (stays text, no test pinning the round shape).
2. Money limit: may a paid run ever go past the run limit you approved?
   - 2a (recommended, A,B) Never. The run is refused, even if the leaf then stops and waits for you.
   - 2b Warn and let it run.
   - Steers: #126 refuse vs warn, and how careful #127 is with paid checks.
3. Unknowns that cost money to check: who pays to find out whether a promised result really works?
   - 3a (recommended, B,C) The chart door, before handoff, with one small capped check you approve. If you don't approve, the promise is narrowed to what was already proven.
   - 3b Hand off with the gap written down, and the leaf finds out while building.
   - 3c Narrow or defer the promise before asking for any more paid work.
   - Steers: #127 how strict the handoff check is, and #126 whether chart-time checks count against a limit.
4. Scope: fix the reported case or the whole kind of problem?
   - 4a (recommended, A) The whole kind, when it adds no more parts. For example, count every paid operation and not only recorder runs.
   - 4b The reported case only.
   - Steers: leaf size in #126 and #127, and whether #125 drawings cover any visible option or only UI panels.
5. Existing work: do the fixes apply to leaves already open or handed off?
   - 5a (recommended, C) New grants and new handoffs only. No migration and no re-check of old handoffs.
   - 5b Open leaves too, with a migration for the old format.
   - Steers: #126 (replace the free-text limit or add a counted field beside it), #127 (re-check past handoffs or not).
6. The herdr-app move: should new work stay out of code the move will replace?
   - 6a (recommended, A) Yes. New checks go in engine code the move keeps (`readiness.ts`, `run-check`, the handoff check), never in herdr-only scripts.
   - 6b Ignore the move.
   - Steers: where the #126 and #127 checks live.
7. Order of the three charts, and is any dropped this session?
   - 7a (recommended, A,C) #127, then #126, then #125. #127 cost the most (about 10 paid sessions, 3 stops), and its answer sets what #126 must count.
   - 7b (B) #126, then #127, then #125, so spend control comes first.
   - 7c #127, #126, and drop #125 to a later manual session, since under autopilot nobody reads the round drawings this session.
   - Steers: session order, and whether #125 is charted now.

Answer and reason:

Operator 2026-11-04, door t15, verbatim: "1c | 2b | 3a | 4a | 5a | 6a | 7a |"

Read as (asked in the simpler wording of the same round):
- 1c: written rules only; the agent keeps its own count. No new command refusals.
- 2b: a paid run past an approved bound is allowed with a warning.
- 3a: the chart door checks a key promise before handoff with one small paid test the operator approves; without approval the promise is cut to what is already proven.
- 4a: fix the whole family of the bug when it adds no parts.
- 5a: new grants and handoffs only; no migration of open leaves.
- 6a: new work lives in akrogon parts the herdr-app move keeps.
- 7a: order proof-limits-handoff (#127), grant-run-count (#126), round-drawings (#125); none dropped.

What the session prioritizes and gives up (A): written skill rules over command checks, a whole bug family over the single case, charting-time proof over discovery during the build, and only parts that survive the herdr-app move. It gives up command-enforced refusals and a hard cap on paid runs: overspend past a bound can still happen, with a warning.

Exclusions: 3a's charting proof rule (owned by leaf proof-coverage/coverage-audit; this leaf only states that the door's probe counts against the leaf grant and still waits for approval) and 7a (chart order) have no other home here.

### grant-count (issues/chart/grant-run-count/forks/grant-count.md)

Question:

1. What does a repeat bound count, and who says so?
2. What happens at the bound under signpost 2b, and for which bounds and seats?
3. Where does the running count live, and who may launch when two seats share a phase?
4. Who reads the warning, and what does review do with an overrun?
5. Which seats, operations and renewals does the rule cover?

### Carries

- Signposts (issues/chart/round-drawings/forks/signposts.md, Taken): 1c written rules only; 2b "Allow it with a warning. The task keeps moving, but costs can go over."; 3a one operator-approved charting test; 4a whole family; 5a new grants only; 6a parts the herdr-app move keeps.
- Earlier operator answer, #107 chart issues/chart/paid-proof-bounds/forks/bound-unit.md Taken (2026-10-19): no unit, free-text bounds ("I don't want to overcomplicate the system").
- Intake: Tamdoma/akrogon#126.

Answer and reason:

A's picks under autopilot, 2026-11-04 (not operator words).

1. New grants write each repeat bound with its unit and what consumes one, in plain words (for example "at most 2 recorder invocations, counting every invocation that reaches a paid session, whatever its outcome"; nested units such as sessions per invocation as their own bound). The seat rule counts every covered launch that reaches its paid or live stage, whatever its outcome and whatever the bound's wording; "known-good" or "successful" in a bound never narrows the count. The chart-issues "Take" grant paragraph and the shapes.md `bounds` placeholder say so; `stop_line` never restates a repeat count.
   - Reason: signpost 4a and the evidence (the bound with a unit was kept, the one without was not). Free text stays, so no schema and no fixed form (1c, the 2026-10-19 "no unit" answer's simplicity intent).
   - Pick against an earlier operator answer: bound-unit (2026-10-19) kept bounds with no unit; this pick requires plain-words units in new grants, on today's signpost 4a and the #126 evidence.
   - Rejected: a fixed bound form (C; more form than needed); a schema field (1c, 5a); seat definition alone with free bounds (C X5: two texts would compete).
2. Signpost 2b applies to leaf seats and repeat-count bounds only: before a launch past such a bound the seat writes a warning and continues. Spend caps, operation, target, identity, effects, expiry and every other `stop_line` clause keep their stops; when a launch would cross both a repeat bound and a stop, the stop wins; on old grants a `stop_line` clause that only restates a repeat count reads as the bound (5a, no migration). The chart door keeps the operator approval wait for every paid proof call and signpost 3a's one test; it never warns and runs.
   - Reason: operator wording "The task keeps moving, but costs can go over" (C withdrew its stop reading); B K4a scope; C X2, X4, X6.
   - Rejected: stop at the bound (contradicts 2b); warn and run once (needs the count it lacks); warn-and-run for spend caps (2b's question was about runs; money keeps a hard stop, low-confidence reading recorded).
3. One count line per covered launch in the seat's existing pass artifact, written before the launch (grant entry, bound, count so far, unit) and completed after (outcome, IDs, sessions, cost when known); a seat reads earlier artifacts' lines before its first launch. Prior use that cannot be established is written as unknown with what is unknown, never as a number, and the next launch carries the warning. In check.review no seat launches a covered operation unless `plan.md` names the seat that runs that live proof; check.repair keeps B as today; merge keeps the merge seat.
   - Reason: B F1, F2; C X3 (blind review makes a shared count unreadable, so one owner is the only rule that leaves no unwarned overrun).
   - Rejected: accept the race as a limit (A's first pick; leaves an unwarned overrun); a shared tally file (a new part).
4. The warning goes in the pass artifact and in the seat's visible reply before the launch. Review: a warned overrun is information and the proof stands; an unwarned overrun, a count that does not match `check-<name>-*.log` and `issues/timings.jsonl`, or paid activity the artifacts do not explain is a Fix (correct the accounting), and an Operator action when the next launch needs a renewed grant. Proof-quality and other authorization judgments are unchanged.
   - Reason: B F5, C X1, X8.
5. Family: all four copies of the reuse sentence, standing-design's recorded-output "covering grant" sentence (2b's warn-and-run counts as covered for repeat bounds), and implement-issue "implement": a worker command that can reach a paid session is counted by A, who writes its count line. Every covered operation (paid launches and live changes) counts by its bound's unit. Renewal: a new grant entry states its new total or "N more after <date or commit>", and the next count line names the entry it draws on (chart-issues "Take" grant paragraph). The door's charting probe counts against the leaf grant it runs under.
   - Reason: B R4, F4; C X7, X9; signpost 4a.

Carried: new grants only (5a); no `src/`, schema or new file (1c); the change reaches seats only at the next release link; a provider-side cap (#107's revisit trigger) is an operator account step, Off route.

### Final-shape check, adopted 2026-11-04 (A's picks; slots/final-and-leaf-review-B.md, -C.md)

- Pick 2 (C S1): the warning exception covers repeat-count bounds of a paid operation only; a live-change repeat bound (a second destructive pass, "at most one pass rerun after a failure") keeps its stop.
- Pick 2 (B F1): the old-grant `stop_line` exception is removed. The rule applies to every grant a seat uses; signpost 5a holds because no open leaf in any registered repo holds a grant at handoff (A scanned every `issues/open/**/readiness.yaml`, 2026-11-04: none with `grants`).
- Pick 3 (B F2, C S3): unknown prior use warns only for a repeat count; when it prevents establishing compliance with a stop-type bound (spend cap or any other stop), the seat takes the operator-blocker stop.
- Pick 3 (B F3, C S2): check.review launches no covered operation; live proofs run in implement (A) and check.repair (B) as today; a needed live proof review finds missing from the plan is a Fix for check.repair. No plan-issue hook.
- Pick 4 (C S4): an Operator action is recorded when a stop-type bound or `stop_line` blocks the next launch.
- Pick 3 (C L4): a covered launch runs through `akrogon run-check`, so its log and timing row exist for the audit.
- Merge seat artifact (C L3): `review-B.md`.
- Why wording (B F4): at least three paid-reaching runs under the renewed two-run grant; "about six against four" is a duration-based inference.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md. Skill text only: no secrets, auth, backend or browser surface. No vanity tests: no test pins the prose; review reads it against the done-criteria. This leaf edits the recorded-output line's covering-grant clause in the same file and keeps every other line unchanged.

## Leaf architecture

Owned surfaces:
- The grant sentence in "Shared context" of `skills/plan-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/check-issue/SKILL.md` and `skills/merge-issue/SKILL.md` (each begins "... reuses `grants[]` for the operations they cover"). The four copies say the same rule (a paragraph, not necessarily one sentence) in the same words, adjusted only for the seat and its artifact (`implementation/report.md` for implement A, `review-<slot>.md` for review seats, `review-B.md` for the merge seat, the plan's own artifact for plan.synthesis).
- `skills/implement-issue/SKILL.md` "implement": one clause on workers' paid commands.
- `skills/check-issue/SKILL.md`: the check.review no-launch clause and the review audit outcome (where review judges the report against the brief and grant).
- `skills/chart-issues/SKILL.md` "Take", the grant paragraph: unit wording, `stop_line`, renewal, door probe counted, door never warns and runs.
- `skills/chart-issues/assets/shapes.md` "readiness.yaml": the `bounds` and `stop_line` placeholders.
- `skills/chart-issues/assets/standing-design.md`: the recorded-output line's "runs only under a covering grant, never as a silent fallback, and otherwise the seat takes the operator-blocker stop" clause.

Consumers: every lifecycle seat before a covered launch; the check seat at review; the chart door writing grants. No code reads `bounds` or `stop_line`: `src/readiness.ts` `grantSchema` stays as is (1c).

Overlap: leaf proof-coverage/coverage-audit edits other paragraphs of chart-issues "Take" and shapes.md "Preflight and validation". Different paragraphs; no dependency; a rebase conflict is resolved by keeping both.

Exclusions:
- `src/`, `tests/`, `issues/`, docs: unchanged (a docs grep for grant bounds and stop_line found no restatement; `docs/reference/limits.md` and `docs/use/autopilot.md` stay true).
- Provider-side spend caps: an operator account step, Off route.
- Old grants: not migrated (5a).
- The installed release copy: updated by the normal release.

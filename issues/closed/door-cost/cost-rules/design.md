# Design: cost-rules

## Binding decisions, verbatim

Sources: issues/chart/door-cost/INTAKE.md (operator 2026-10-26: "go with your recommendation without the caps", after "go 01b, but also the other smaller changes?"), issues/chart/door-cost/slots/map-merged.md with rebuttals, and issues/chart/door-cost/forks/carry-rules.md Taken (A's picks under autopilot, 2026-10-26).

- **Scope (operator).** O1b, O8 and O4 only. No prose caps (O6 declined). Every blind step stays: blind maps and notes, merge, one rebuttal, final checks, leaf review, consultant restarts. Attended handover at chart switches only, never mid-chart and never at session end.
- **Trigger (A,B,C).** Exactly the Drain move-on points where Drain names a next chart, after the outgoing records are written, every consultant turn is collected and the span is closed. A presented round or handoff review is not a switch. No reset at first entry, after compaction, inside a chart, or when the pass ends. Re-entry to a chart left earlier counts as a switch.
- **Q1 1a (A's pick).** Fresh A continues only when the start prompt matches old A's handover entry in the next chart's Mode record, naming the outgoing mode, pane, time, log and next chart. No match starts attended in no chart. Fresh A appends its continuation with its live session, and records its seat and span before chart work. Rejected: prompt alone, which leaves nothing on disk to check.
- **Q2 2a (A's pick).** Old A writes every conversation-only operator instruction still in force, verbatim with provenance and scope, into the next chart's records before queueing the reset. Session instructions go in the handover entry detail and are carried forward at later handovers. Approvals for the outgoing chart's own work go into the outgoing chart's records before its span closes. Choices and approvals already durable are referenced, never restated. A dropped consultant is never revived. Rejected: prompt only (the reset wipes it), reference only (misses unsaved instructions), and a filter on what binds later charts (C dissent accepted).
- **Q3 3b (A's pick).** door-reset.ts records the session boundary when the handover is queued. It cancels with a logged `superseded` result when a later operator input or turn appears after that boundary, checked while waiting and at the recheck before the reset is sent. An unreadable marker sends nothing. The handover entry names the log path. The change covers autopilot too. The remaining interval between the last check and the send is a stated limit. Rejected: accept and document, because the footer prints at the moment the risk starts (A's first pick; B and C dissent accepted).
- **Q4 4a (A's pick).** Reset at every chart switch with a named next chart, re-entry included, with no floor. Rejected: short-chart or revisit floors, which have no observable measure and keep carried context.
- **Q5 5a (A's pick).** Two corrections, or a correction and a lock or Taken answer, that differ in meaning, obligations or behavior go back to the operator before the batched check (under autopilot, A's recorded pick). A resolves only wording. Rejected: A resolving substance, and applying a general recorded priority as an answer (C).
- **O8 (A,B,C).** A door-created C with no operator-named kind starts as kind `pi` with empty argv. Explicit kind or arguments win. Supplied panes are untouched. B and later seats are still asked. Both copies of the created-peer paragraph change. peer-create.ts is unchanged, and restarts keep their live kind and argv. There is no fallback if pi cannot start: the existing failed-create rule applies. Empty argv keeps the 2026-10-06 chart-cost lock "not hard coding any models": pi uses its own configured default.
- **O4 (A,B,C).** All mechanism or contract corrections from one operator reply (under autopilot, one pick) for one fork go into one proposed final shape. The corrections are marked so interactions show. Every named peer checks it once before recording. There is no batching across forks or across replies. A correction adopted after the check gets another check only when it adds a mechanism or changes the contract. Restatements stay exempt. Fresh research on a reshaped question, the one rebuttal against the merge, and leaf review keep their own triggers. The batched brief names its round so return paths stay distinct.

## Standing design

/home/ivan/.akrogon/releases/abf1909958c01438cc78e662180e8e2eddb115af/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf:
- Criteria 1-3 are helper logic at the herdr CLI boundary. They are proven by own tests running the script against `tests/fake-herdr.ts` with session records. The operator-input records are copied from real sessions on this machine (source file and date named in the test fixture), never hand-invented shapes. Each new behavior is shown by one deliberate break turning its test red.
- Criterion 1's second timing (input first appearing after the turn end was seen) needs the session record to change mid-run, so the recheck branch runs. Use the existing pattern in tests/door-reset.test.ts ("a session change during the turn wait is logged and nothing is sent"), where a wrapper herdr changes state on a later `agent list` call, here appending the input record. Its deliberate break is removing the recheck's input check. (A,C)
- Criteria 4-6 are skill text. They are proven by review, with test string checks only for the entry names and footer that records parse. The existing docs case in tests/door-reset.test.ts gains the attended entry names (`attended next` and `continue attended (handover`) in both SKILL.md and shapes.md, shown red by removing one. There are no whole-sentence wording tests. (A,C)
- No live run and no paid model launch: the reset path itself was proven live for claude, codex and pi on 2026-10-17 (issues/chart/door-handover/forks/handover.md) and ran in live autopilot handovers on 2026-10-22. No machinery is built.

## Leaf architecture

Owned surfaces:
- `skills/chart-issues/SKILL.md`: `## Open` (created-peer paragraph, seat record for fresh A), `## Drain` (move-on points name the handover), `## Take` (final-shape check), `## Autopilot` (handover paragraphs moved to shared text, autopilot differences kept), `## Printed footer`.
- `skills/chart-issues/assets/questions.md` `## Blind peer exchange` (created-peer paragraph, final-shape check paragraph).
- `skills/chart-issues/assets/shapes.md` `## Chart records` (Mode record no longer autopilot-only; the attended handover entry and continuation forms).
- `skills/chart-issues/scripts/door-reset.ts`.
- `skills/chart-issues/scripts/peer-wait.ts`, only to export its existing claude transcript and pi session locators for door-reset.ts to reuse, with peer-wait behavior unchanged. (A,C)
- `tests/door-reset.test.ts`, and `tests/fake-herdr.ts` only where a case needs it.
- Docs that describe attended charting, such as `docs/use/plan-work.md`, only where the diff makes them stale.

Interfaces:
- `bun <skill-folder>/scripts/door-reset.ts <A pane> <A session> <log> <start prompt>`: unchanged arguments. The parent captures the boundary (the session record's byte length) before detaching and hands it to the child. An unreadable record at that point is a parent refusal: stderr, non-zero exit, no log, like the existing identity-mismatch refusal. Open for the plan: how the boundary passes to the child (argument, environment variable or log line). (A,C)
- New log result `superseded` in the `wait-turn-end` or `recheck` step, alongside the existing results. A reader of the log (A or the operator) finds it through the log path in the handover entry.
- Handover entries, Mode record lines in the existing `- mode <time> <pane> <session>: <entry>` form (A,C):
  - autopilot: `handover <time> <log>: handed <remaining list>; consultants <surviving>; instructions <verbatim with provenance and scope, or none>`;
  - attended: `handover <time> <log>: attended next <chart>; consultants <surviving>; instructions <verbatim with provenance and scope, or none>`;
  - continuation: `continue autopilot (handover <time>)` or `continue attended (handover <time>)`. The continuation consumes the handover: a start prompt matches only when the latest entry is that handover (A,B).
- Pending Destination: a CHART.md that old A creates for a next chart with no folder holds `pending map by fresh A (<seed path, legacy path or operator note reference>)` under Destination plus the Mode record, and no INTAKE.md. shapes.md permits this until fresh A writes the Destination after its map. (A,C)

States this change alters, and the consumers that rely on them:
- A's session record after the queue point. The consumer is `door-reset.ts` `child`, through `waitTurnEnd` and the recheck. Today only `codexRollout` in `skills/chart-issues/scripts/peer-wait.ts` returns a record path; `claudeTurnOpen` keeps the transcript path internal and `piAuthority` reads no file. The leaf exports peer-wait's existing claude transcript and pi session locators and reads the records after the boundary in door-reset.ts. Charting evidence, recorded in issues/chart/door-cost/forks/carry-rules.md Findings ("Input signals", 2026-10-26) (A,B,C):
  - claude: operator input carries `origin.kind` `human`, on `user` entries (promptSource `typed`, `queued`, `suggestion_accepted`) and on `queued_command` attachments for input absorbed mid-turn. The queuing turn's own entries carry no such origin: tool results, meta entries, compaction summaries, and task notifications (`origin.kind` `task-notification`). A `queue-operation` `enqueue` alone is not input, since task notifications enqueue too.
  - codex: every turn starts with `task_started`, and role-`user` messages (including injected context starting with `<`) appeared only at turn start in 40 rollouts; none appeared later in a turn.
  - pi: role `user` appears only for input, including 48 delivered mid-run after a `toolResult`; tool results use role `toolResult`.
- The Mode record becomes part of attended charts. Consumers: SKILL.md Autopilot (reads the latest entry before continuing) and the "another door's open chart" hold check (reads seats.yaml, not the Mode record). No script parses `- mode` lines: checked 2026-10-17 for door-handover. Open for the plan: recheck with `grep -rn` over skills/chart-issues/scripts and src.
- A's session changes inside one pane in attended charts too. The consumers are seats.yaml (a new A entry, same letter and pane, by the existing Open rule) and `chart-usage.ts`, which counts each seat entry by session (`locate`, `claudeSession`), so two A sessions on one pane count separately. Fresh A records its seat and opens its span before opening work, so its opening reads fall inside a span.
- Created peers: the door's seat spec for `peer-create.ts` gains `{"seat":"C","kind":"pi","argv":[]}` when C is unnamed. peer-create.ts itself is unchanged and passes argv straight to `herdr agent start`.

Exclusions:
- Autopilot behavior beyond sharing the handover text and gaining the reset cancel.
- Any kind other than claude, codex and pi.
- Consultant model choice beyond the C kind default.
- Rebuttal, blind notes and leaf review triggers.
- Prose caps.

Stated limits:
- Input that arrives between the last check and the reset send is not caught. Closing that interval needs an atomic operation the harnesses do not offer.
- Codex input typed mid-turn was never observed, so its record is unknown. If codex records it as a role-`user` message it cancels. Otherwise it is caught only when it starts a new turn before the recheck. (A,B)
- A claude interrupt with no typed input (`[Request interrupted by user]`, no `origin`) does not cancel. (A)
- A /clear wipes the operator's visible scrollback in the pane. The chart records and the footer stay the record.
- A switch-heavy pass pays a fresh start and process re-reads at each switch. The usage lines at each handoff review show it.

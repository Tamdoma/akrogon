# Failed exits

## Question
Q1 Before merge, when a check fails because main is broken, does the leaf keep going?
Q2 When a seat cannot start or does not receive its prompt, does the leaf fail?

### Carries
- stop-rules Taken (forks/stop-rules.md): S1 per-leaf wait at merge, S2 no round-cap failed, S3 guard at creation.
- red-base-wait waiting-leaf Taken (`issues/chart/red-base-wait/forks/waiting-leaf.md:43-51`): one without-change run, per-test attribution, unresolved attribution is unverified, incomplete verification still blocks.

## Findings
Ledger slots/failed-exits.tsv: 43 failed transitions since 2026-10-08; 21 base-red, 5 round cap, 5 seat delivery, 11 human boundary, 1 seat misreading (row 31) (A,B,C; counts per B rebuttal F4).
Notes: slots/fork-failed-exits-B.md, slots/fork-failed-exits-C.md, merged slots/fork-failed-exits-merged.md, rebuttals slots/fork-failed-exits-rebuttal-B.md, slots/fork-failed-exits-rebuttal-C.md.
- Research: Chromium CQ reruns without the patch and fails only on tests that passed without it (https://chromium.googlesource.com/chromium/src/+/master/docs/infra/cq.md) (B,C); Google post-submit culprit finding (https://research.google/pubs/what-breaks-google/) (A); matklad "Catch Flakes On Main" 2026-05-14 (C).
- Held: B preferred no pre-merge rerun with one comparison at merge (1b); C showed it inverts the waiting-leaf lock. B: per-name matching can pass a second failure inside a test already failing on base; caught at merge under S1.
- Held: B F6, crashed or incomplete base runs still end failed under the lock.
- Row 31 (site-media-publisher): technical, misread by the seat; `skills/implement-issue/SKILL.md:36` already allowed the fix (C rebuttal), no rule change.

## Taken
Operator, 2026-10-11, on the simplified round: "1a | 2a |"

S4 pre-merge-red (1a)
- Skill text only: `skills/check-issue/SKILL.md:65` and `skills/implement-issue/SKILL.md:38` lose the `failed --reason "<command> red on base <sha>"` ending. One without-change run as today; the seat records the failing unit names from both complete logs in the leaf folder; the leaf continues when every unit failing with the change also fails on base and the reviewer finds no cause in the diff; a unit failing only with the change is a Fix; a crash, setup or build failure on either side still blocks (C, waiting-leaf lock).
- known-red-leaf amended: its stop-removal clause moves here; it keeps the record schema, `--compare`, red record and notice, and leaves the critical path (C). known-red-merge unchanged by S4.

S5 seat-retry (2a)
- Delete the automatic failed moves at `src/next.ts:560-566` and `:572-580`; the leaf keeps its phase, the error and attempt count show in status, the next pass retries (B,C).
- When herdr reports a dead agent in the owned pane, relaunch; reconcile late delivery instead of resending, with the offset bound to its recorded session (B; C rebuttal: required, since the relaunch branch runs only on `pane.agent === null`, `src/next.ts:605`).
- Agent naming unchanged first; a fresh name per launch only if a name stays taken across passes (C rebuttal; B preferred a fresh name now).
- A next pass needs a trigger when no agent exists: carried to forks/keep-running.md (B F3, C rebuttal D2).

Foreclosed: pre-merge wait for main; keeping failed for seat delivery faults; a new phase or daemon for delivery.

## Proof after Taken (door, 2026-10-11)
- Operation: herdr report of a dead agent, and agent-name reuse. Commands: `herdr tab create --workspace w8 --cwd <scratch>/probe --label door-probe-dead-agent --no-focus`; `herdr agent start door-probe-dead --kind claude --pane w8:pMP --timeout 60000 -- --model haiku`; `kill -9 <agent pid from herdr pane process-info>`; `herdr pane get w8:pMP`; `herdr agent list`; the same `agent start` again; `kill -9`; `herdr tab close w8:tAT`. Identity: operator's local herdr session (user ivan), no credentials. Version: herdr 0.9.3.
- Result: right after the kill and 8 s later, the pane reads `{"agent":null,"agent_status":"unknown","agent_session":null}` and `herdr agent list` omits it; the second `agent start` with the same name succeeded (`idle`). So a dead agent already takes the existing relaunch branch (`src/next.ts:649`, `pane.agent === null`) and the per-pane name (`:651`) is reusable after death.
- Cleanup: both agent processes killed, tab closed, `herdr tab list` shows no `w8:tAT`, scratch directory removed.
- Limits: one kill -9 of an idle claude agent; does not cover a hung agent that herdr still reports, or other harness kinds.
- Effect on S5: the relaunch and fresh-name parts need no new code. S5 reduces to deleting the automatic failed moves, now at `src/next.ts:604-610` (attempts) and `:616-624` (unreachable); late delivery is already reconciled by offset at `:641-648`.

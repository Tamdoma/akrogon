# Plan: peer-wait-signal

Direct synthesis (`debate: "no"`), from the brief, locked design and live surfaces.

## Read first

- `skills/chart-issues/scripts/peer-wait.ts` — wait loop, `readPeerAgent`, `turnOpen`, `finish`.
- `skills/chart-issues/scripts/peer-ask.ts` — prompt+wait pairing.
- `tests/fake-herdr.ts` — pane db, `waitScript`/`promptScript`, `agent list`/`wait` fakes.
- `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts` — harness, `expectOutcome`.
- `skills/chart-issues/assets/questions.md` — the one long peer-exchange paragraph (line 46) holding the rerun command and outcome wording.
- `src/shell.ts` `paneSchema` — `agent_session {kind,value}` shape the fake reuses.
- Live reference: `herdr agent list` entry = `{agent, agent_status, agent_session:{agent,kind,source,value}, screen_detection_skipped, pane_id, ...}`; codex rollout line = `{type:"event_msg", payload:{type:"task_started"|"task_complete"|"turn_aborted", turn_id}}` at `~/.codex/sessions/Y/M/D/rollout-*-<session>.jsonl`.

## Decisions

D1. Outcome line becomes `{outcome, pane, file, status, signal, exchange}`. `signal: 'proven'` when the outcome is `done`, `blocked` or `failure` (each is itself a proven verdict); for `budget` it is `proven` iff the last turn check evaluated a proven channel. Readers: only the chart door's prose (questions.md) and the test assertions; no other code parses the line (peer-ask inherits the child's stdout verbatim). This settles "Open for the plan: strict readers" — none exist.

D2. Exchange identity carries as an optional positional arg: `peer-wait.ts <pane> <return-file> <budget-seconds> [exchange-json]`, echoed back on every outcome line as `exchange`. Schema `{kind: string, session: string|null, boundary: number|null, turn: string|null}`. questions.md's rerun command gains `'<exchange>'` copied verbatim from the outcome line.

D3. `peer-ask.ts` seeds the exchange: for each ask it runs `herdr agent list` before `herdr agent prompt`, takes `{kind, session}`; for `kind: 'codex'` with a session it sets `boundary` to the byte length of the unique `~/.codex/sessions/*/*/*/rollout-*-<session>.jsonl` match (glob `*/rollout-*-<session>.jsonl`), `null` on zero or several matches; `turn: null`. The seeded JSON is argv[5] of the peer-wait spawn. A failed `agent list` or a pane absent from it is treated exactly like a failed prompt: stderr, that peer's wait skipped, non-zero exit. A direct `peer-wait.ts` run with no exchange seeds `{kind, session}` from its own initial `agent list` with `boundary: null`, so codex is unproven on such runs — the design's safe default.

D4. Loop shape in `peer-wait.ts`: after the grace `runWait` returns without `working`, re-read `herdr agent list` (new `readPeerAgent` return also carries `agent_status`, `agent_session.source`, `screen_detection_skipped`), apply identity rules against the carried exchange, then read the live `agent_status` from the list entry: `blocked` → `blocked` outcome; `working` → resume the loop; otherwise run the per-kind turn check. `idle` and `done` are handled alike throughout.

D5. `turnCheck(exchange, liveEntry) → 'ended' | 'open' | 'unproven'` replaces `turnOpen`:
- `claude`: session required (existing throw); `ended` iff `claudeTurnOpen(session)` is false, else `open`. Unchanged logic.
- `pi`: authority = `agent: 'pi'` && `agent_session.source === 'herdr:pi'` && `screen_detection_skipped === true`; authority → `ended` (herdr status was idle/done inside grace); lost authority → `unproven`.
- `codex`: no session, null boundary, or not exactly one rollout match → `unproven`. With a match, read bytes after `boundary`: bind `turn` to the first `task_started`'s `turn_id` (persisted into `exchange` and echoed), `open` while bound with no `task_complete`/`turn_aborted` for that id, `ended` on one; no `task_started` after the boundary yet → `unproven`.
- every other kind: `unproven`.
`ended` → `failure` (`budget` when the deadline truncated the grace, unchanged rule); `open`/`unproven` → keep waiting; deadline → `budget`.

D6. Identity rules against `exchange` at each grace re-read (criterion 6): `agent` (kind) differing from `exchange.kind` → error naming both for every kind; `exchange.session` non-null and `agent_session.value` non-null and different → error naming both for `claude` and `codex`, ignored for `pi` while authority holds (and authority loss itself → `unproven`); `exchange.session` null + live non-null → adopted into `exchange` (echoed for reruns); pane absent from the list → existing `No herdr agent on pane <id>` error.

D7. Fake herdr additions (fixture data only): persist `waitScript` `entry.status` onto the pane's `agent_status` and run the `--until` check against the resulting status; `agent list` output gains `agent_status`, `screen_detection_skipped`, and `agent_session` entries `{kind, value, source, agent}`; `waitScript` entries gain optional `session`, `kind`, `dropAgent`, `screenSkipped` mutations; `promptScript`/`scriptEntrySchema` gains `appendTo` (append target overriding the session-path default, used to write rollout lines). peer-wait tests run with `HOME` pointed at a temp dir holding fixture `.claude/projects` transcripts and `.codex/sessions` rollouts.

## Interfaces

- `peer-wait.ts` argv: `pane file budget-seconds [exchange-json]`; stdout: `{"outcome","pane","file","status","signal","exchange"}`.
- fake `agent list` entry: `{pane_id, agent, agent_status, agent_session?: {kind, value, source, agent}, screen_detection_skipped?: boolean|null}`.
- fake `waitScript` entry: `{status?, stderr?, code?, append?, appendTo?, sleepMs?, session?, kind?, dropAgent?, screenSkipped?}`.
- fake `promptScript` entry: `{code?, message?, stderr?, append?, appendTo?}`.

## Checklist

Wave 1
- U1 `peer-wait.ts` signal/identity engine. Owns `skills/chart-issues/scripts/peer-wait.ts`. Depends on the test commit's fake-herdr fields. Lands first.
  Criterion: all new peer-wait cases green; existing suite green.

Wave 2
- U2 `peer-ask.ts` exchange seeding (list-before-prompt, codex boundary, argv[5]). Owns `skills/chart-issues/scripts/peer-ask.ts`. Needs U1's argv contract.
  Criterion: peer-ask cases green, including boundary plumbing to `failure`.
- U3 Door prose + lesson retirement. Owns `skills/chart-issues/assets/questions.md`, `skills/chart-issues/SKILL.md` (only if the rerun command is restated there — it is not, so only questions.md), `learnings/LESSONS.md`, `learnings/history/2026-10-15-peer-wait-antigravity-idle.md`. Needs U1's final command/line shape; disjoint paths from U2.
  Criterion: rerun line carries `'<exchange>'`; unproven-idle-budget operator rule present; lesson line gone; history file gains `Applied <date> by skills/chart-issues/scripts/peer-wait.ts:<turnCheck line>: failure only on a proven per-harness end signal`.

## Verification

Done-criterion → proof mapping. Commands run via `akrogon run-check` at synthesis for red, and are the rerun triggers. `bun test` is the repo runner (exists at AKROGON_BASE); no new machinery.

| # | Criterion proof | Command | Size | Red shown |
|---|---|---|---|---|
| C1 | agy/`fake` kind, idle+done paths: outcome `budget`, `signal: unproven`; and `done` when file lands during grace. Tests: "unproven kind waits out the budget on idle", "unproven kind budgets on done with a 0-byte return file", "unproven peer that answers during grace ends done". Boundary: real `peer-wait.ts` process against fake herdr. | `bun test tests/peer-wait.test.ts` | seconds | pending |
| C2 | pi authority → `failure`/`proven`; `screen_detection_skipped` null and `source` other → `budget`/`unproven`; mixed pi+codex list parses (the pi test's fixture seeds a codex sibling pane). Tests: "pi peer fails on idle only while hook authority holds", "pi peer without authority stays unproven". | same file | seconds | pending |
| C3 | codex rollout binding: `task_complete`/`turn_aborted` for the post-boundary `task_started` → `failure`/`proven`; complete only before boundary, zero matches, several matches, missing boundary, no post-boundary `task_started` → `budget`/`unproven`. Tests: "codex peer fails only on its bound turn's end", "codex peer is unproven without a bound turn" (cases). | same file | seconds | pending |
| C4 | claude transcript check kept: open transcript → `budget`/`proven`; `turn_duration` closed → `failure`/`proven`. Test: "claude peer keeps the transcript check". | same file | seconds | pending |
| C5 | `blocked` persisted by the grace wait's scripted status, read at the list re-read → `blocked`. Test: "blocked read at a grace check ends the wait blocked". | same file | seconds | pending |
| C6 | kind change → error; session change → error naming both (claude, codex); pi session change under authority → `failure` (ignored); authority loss → `budget`/`unproven`; null→set adopted → claude check runs → `failure`; agent dropped → `No herdr agent on pane` error. Tests: "identity re-read at each grace check" (cases). | same file | seconds | pending |
| C7 | rerun with carried exchange: codex bound turn survives a second run (failure), rerun with a `task_started` that post-dates the boundary stays bound to the original turn; mismatched carried kind → error; mismatched carried session → error. peer-ask records the boundary before prompt: `agent list` precedes `agent prompt` in calls, and a `task_started`+`task_complete` appended at prompt time yields `failure`. Tests: "carried exchange binds the original turn on rerun", peer-ask "seeds the exchange before prompting". | `bun test tests/peer-wait.test.ts tests/peer-ask.test.ts` | seconds | pending |
| C8 | every outcome line carries `signal`; asserted by `expectOutcome` on every case. questions.md rule is prose: inspected, not executed. | covered above + `bun test tests/peer-ask.test.ts` | seconds | pending |
| C9 | LESSONS.md line removed; history gains `Applied` line naming `peer-wait.ts` line. Prose diff, checked by `retiredLessonsPresent` in existing lessons.test.ts machinery at merge; direct proof: `grep -c antigravity learnings/LESSONS.md` = 0 and the history file contains `Applied `. | `grep -n antigravity learnings/LESSONS.md; grep -n 'Applied ' learnings/history/2026-10-15-peer-wait-antigravity-idle.md` | seconds | text change |

Deliberate-break proofs at implement time (criteria green on today's code because the old path coincidentally matches): pi authority `failure` — break by dropping the `screen_detection_skipped === true` condition; codex bound-`failure` — break by ending on any `task_complete` ignoring `turn_id`; claude C4 — break by returning `ended` unconditionally.

New proof machinery: none — all fixtures extend `tests/fake-herdr.ts`, which is existing test code, not machinery.

Docs: `questions.md` and the two learnings files above are the only affected docs; SKILL.md's "peer-wait script rule" references stay generic — no edit unless the rerun text is duplicated there (verified: it is not).

Open limitations carried: none in scope. Known surface left as designed: a codex peer prompted through a path other than peer-ask has no boundary and is unproven (D3).

## Test red results (filled during synthesis)

See below; commands and failing output recorded per criterion.

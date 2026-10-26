# Brief 1: door-reset cancel, boundary and unreadable handling (U1)

## 1. Goal

Implement decisions D1-D5 of `plan.md` for leaf `cost-rules`: `door-reset.ts` records the session-record byte boundary when the handover is queued, cancels with a logged `superseded` result when later operator input appears after that boundary (checked while waiting and at the recheck before the reset is sent), and treats unreadable session records as a parent refusal at queue time and a logged `record unreadable` mid-wait.

## 2. Acceptance criteria

From plan.md criterion proofs C1-C3; the committed tests in `tests/door-reset.test.ts` are the contract:

1. `a claude user entry|queued_command attachment|codex task_started|codex user message|pi user message recorded while the turn wait runs cancels with superseded` — log line `{"step":"wait-turn-end","result":"superseded"}`, exit 1, zero `agent prompt` calls.
2. `a <kind> user input first appearing after the turn end cancels with superseded at the recheck` — `{"step":"recheck","result":"superseded"}`, exit 1, nothing sent.
3. `a claude queued_command absorbed mid-turn cancels with superseded`.
4. `a <kind> <own record> record after the queue boundary still sends the reset and start prompt` ×4 and the three kept happy-path tests stay green — the queuing turn's own records never cancel.
5. `claude operator input recorded before the queue boundary still sends the reset` — pre-boundary input does not cancel.
6. `an unreadable <kind> record at queue time is refused with no log and nothing sent` ×3 — stderr contains `refused`, exit 1, no log file, no prompt call.
7. `a <kind> record deleted while waiting is logged and nothing is sent` ×3 — log holds `record unreadable` with a reason, nothing sent.
8. Every previously green test stays green (`refuses when`, `session change during the turn wait`, `turn still open`, `unconfirmed reset`, `stalled`, happy paths). The docs test (`docs describe the handover entries and footer wording`) stays red — its strings are unit U2's.

## 3. Read-first list

`skills/chart-issues/scripts/door-reset.ts`, `skills/chart-issues/scripts/peer-wait.ts` (`claudeTurnOpen`, `codexRollout`, `piAuthority`, `readPeerAgent`, `isTimeoutError`, `ListAgent`), `tests/door-reset.test.ts` (new cases and `wrapLists` helper, `recordPath` resolution), `tests/fake-herdr.ts` (`agent list`/`prompt` contracts), `src/shell.ts` (`quote`, `spawnCaptured`), `<skill-folder>/ponytail.md`. Pattern to copy: `codexEnded` in peer-wait.ts (byte-boundary `subarray` read) and `logLine`/`stop` in door-reset.ts.

## 4. Change list and interfaces

Owns: `skills/chart-issues/scripts/door-reset.ts`, `skills/chart-issues/scripts/peer-wait.ts`. No shared test resource. No prerequisite; wave 1, runs parallel to U2 (docs).

- peer-wait.ts: extract the claude transcript glob out of `claudeTurnOpen` as `export function claudeTranscript(session: string): string` throwing `Expected one Claude transcript for session ${session}, found ${matches.length}` when the count is not 1; `claudeTurnOpen` calls it. `codexRollout` is already exported. peer-wait's own behavior is unchanged.
- door-reset.ts, D1 boundary: after the parent's identity check and before `DOOR_RESET_INLINE`/spawn, resolve the session record path and `statSync` its size. Failure → `refused: pane <pane> session record unreadable: <detail>` on stderr, exit 1, no log (same shape as the identity-mismatch refusal). The detached child receives it via env `DOOR_RESET_BOUNDARY`; the inline path passes it as a `child()` argument. `configSchema` gains `DOOR_RESET_BOUNDARY: z.coerce.number().int().nonnegative().optional()`; a `DOOR_RESET_CHILD=1` process with it absent throws.
- door-reset.ts, D2 record path: `function recordPath(kind: string, live: ListAgent, session: string): string` — claude → `claudeTranscript(session)`; codex → `codexRollout(session)`, throwing when null; pi → `live.agent_session?.value` when `agent_session?.kind === 'path'`, throwing otherwise.
- door-reset.ts, D3 detection: `operatorInputSeen(kind, path, boundary)` reads `readFileSync(path).subarray(boundary)` (bytes, matching peer-ask's boundary comment), parses each line, and returns true on the first post-boundary operator input. Input shapes (fixtures and comments in tests/door-reset.test.ts):
  - claude: `type:'user'` with `origin.kind:'human'`; `type:'attachment'` with `attachment.type:'queued_command'` and `attachment.origin.kind:'human'`. Everything else — `user` with no origin (tool results), `origin.kind:'task-notification'`, meta/compaction/system — is not input. A `queue-operation` enqueue alone is not input.
  - codex: `event_msg` `payload.type:'task_started'`, or `type:'response_item'` with `payload.type:'message'` and `payload.role:'user'`.
  - pi: `type:'message'` with `message.role:'user'`.
  Parse each line leniently (skip unparseable lines), matching the file's existing `parseJson` style.
- door-reset.ts, D4 placement: `waitTurnEnd` per-poll order: `binding` → input check (`return { step:'wait-turn-end', result:'superseded' }`) → `turnEnded`. The recheck adds the input check after its identity re-read and before `send-reset`: `stop(log,'recheck','superseded')`. `child` exits 1 on `superseded` like other stops.
- door-reset.ts, D5 unreadable: inside `child`, every session-record read is wrapped so a locator error, missing path or `readFileSync` failure returns `stop(log,'<step>','record unreadable',{reason})` — `wait-turn-end` while waiting, `recheck` at the recheck. `turnEnded`'s claude/codex record reads share the wrapper, so a record deleted mid-wait logs instead of reaching main's catch. The parent path keeps its own stderr refusal.

## 5. Do-not, reasons and exceptions

- Do not change `tests/` files or `fake-herdr.ts`; planned tests are the contract — a planned test that is wrong or stays red once the code is correct is a mismatch, not a worker fix.
- Do not change `peer-wait.ts` behavior; only the export/extract. It is shared with peer-ask.
- Do not add a `--session` flag, new argv, retries, or a fourth input form; argv stays exactly 4.
- Do not catch errors broadly; the unreadable wrapper covers only record reads inside the child.
- Do not touch SKILL.md, questions.md, shapes.md — U2 owns them.
- If the brief conflicts with a locked design decision or the test expectations, return a mismatch with evidence; the exception is a revised brief from A.

## 6. Ordered steps

1. Read `door-reset.ts`, `peer-wait.ts`, the new tests in `tests/door-reset.test.ts` (~lines 100-260 helpers, 520-740 cases).
2. peer-wait.ts: extract `claudeTranscript`, rewire `claudeTurnOpen` (criterion 8 guard).
3. door-reset.ts: `recordPath`, boundary capture in `main`, `DOOR_RESET_BOUNDARY` config/child arg (criteria 5-6).
4. door-reset.ts: `operatorInputSeen`, wait-loop placement, recheck placement (criteria 1-3,5).
5. door-reset.ts: wrap child record reads for `record unreadable` (criterion 7).
6. `bun install --frozen-lockfile` in your worktree, then run the section-7 command; all cases except `docs describe` must pass.

Advisory size: ~2 files, under 30 turns.

## 7. Commands

Targeted tests (run through run-check from your worktree; the `-u1` suffix resolves the leaf automatically):

`akrogon run-check --name u1 -- bun test tests/door-reset.test.ts --timeout=30000 --test-name-pattern '^(?!docs describe)'`

Cite the printed `check u1: <exit> <path>` line in your report.

## 8. Done-when, evidence and report

All section-2 criteria green in one run; commit on the detached HEAD with message `door-reset: cancel a queued handover on later operator input`; paste results below.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

# Implementation report: peer-wait-signal

Mode: serial-solo (each plan wave holds one unit). Base `76e7f93` (rebased from `ab3c889` during implement), head `87f9a48`.

## Changed files

- `skills/chart-issues/scripts/peer-wait.ts` — `turnOpen` replaced by per-kind `turnVerdict` (ended/open/unproven): claude keeps the transcript check; pi ends only under `agent: pi` + `agent_session.source: herdr:pi` + `screen_detection_skipped === true`; codex binds the first post-boundary `task_started` in the unique `~/.codex/sessions/**/rollout-*-<session>.jsonl` and ends on that turn's `task_complete`/`turn_aborted`; all other kinds are unproven. Identity re-read via `herdr agent list` at each grace check (kind change error, claude/codex session change error, pi ignores session changes, null→set adopted, absent pane → `No herdr agent on pane`). Grace path re-reads live `agent_status` so `blocked` ends the wait. Outcome line gains `signal` and echoed `exchange`; optional argv[5] carries the exchange across `budget` reruns.
- `skills/chart-issues/scripts/peer-ask.ts` — `herdr agent list` before `agent prompt` per ask; seeds `{kind, session, boundary, turn: null}` (codex boundary = unique rollout byte length, null on zero/several matches or no session) and passes it as peer-wait argv[5]. Missing pane or failed list reported and skipped like a failed prompt.
- `skills/chart-issues/assets/questions.md` — rerun command gains `'<exchange>'` copied from the outcome line; `signal` field documented; `budget` + `idle`/`done` + `signal: unproven` reported to the operator before rerun, other budgets rerun at once; `failure` wording names the proven per-kind signal.
- `learnings/LESSONS.md` — removed the peer-wait-antigravity-idle line.
- `learnings/history/2026-10-15-peer-wait-antigravity-idle.md` — appended `Applied 2026-10-16 by skills/chart-issues/scripts/peer-wait.ts:226: ...`.
- `tests/fake-herdr.ts` — `agent list` emits `agent_status`, `screen_detection_skipped`, `agent_session.source/agent`; `waitScript` status persists and entries may set `session`/`kind`/`dropAgent`/`screenSkipped`; `appendTo` on script entries; `--until` checked against persisted status.
- `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts` — planned criterion tests (committed red at `4f89012`).

## Commands and proofs

- `check plan-red peer-wait: 1` / `check plan-red peer-ask: 1` — planned reds recorded in plan.md.
- `check impl peer-wait U1c: 0` — 33/33 peer-wait green at `9fedcf3`.
- Deliberate breaks (each reverted after): `check break pi-authority: 1` (2 red without `screen_detection_skipped`), `check break codex-turnid: 1` (rerun bound-turn red when `turn_id` ignored), `check break claude-always: 1` (open-transcript budget red when claude returns ended unconditionally).
- `check impl peer-ask U2b: 0` — 7/7 peer-ask green at `7ae1686`.
- Refresh: rebased `87f9a48` line onto `origin/main` `76e7f93` (5 commits replayed, no conflicts).
- Final proofs on `87f9a48`: `check final peer-wait fmt: 0` (33/33), `check final peer-ask fmt: 0` (7/7), `akrogon verify` → `verify leaf 87f9a48...: green` (945 tests, format, typecheck; ~126 s test run, minutes). One verify run earlier was red only on prettier formatting, fixed by `87f9a48`.

## Notes for review

- Criterion-9 retirement is a text diff; `retiredLessonsPresent` machinery validates it at merge.
- Direct `peer-wait.ts` runs without argv[5] seed `{kind, session, boundary: null}` from `agent list`, so codex is unproven there by design.
- `budget` echo of `exchange` includes a session adopted mid-run, so a rerun binds the adopted session for claude/codex.

# Brief U2: logMove drops the HERDR_PANE_ID fallback

## 1. Goal

Plan D8: `src/log.ts` `logMove` must attribute `session` only through the slot's recorded pane in the resolved session; the environment pane is never a source. Plan: `/home/ivan/Work/infra/akrogon/issues/open/herdr-session/session-reads/plan.md`.

## 2. Acceptance criteria

1. In `logMove`, `paneId` is `slot === null ? undefined : before.pane[slot]` — the `process.env.HERDR_PANE_ID ||` fallback is deleted.
2. With `slot === null` the record's `session` is `null` even when `HERDR_PANE_ID` names a live pane.
3. With a slot, `session` comes from `before.pane[slot]` looked up in the resolved session, exactly the existing lookup path (resolution refusal and `CommandError` stays diagnostic-only).

## 3. Read-first list

- `src/log.ts` — 70 lines, the whole file is the context.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md`

## 4. Change list and needed interfaces

Files: `src/log.ts` only. One-line-ish edit at line ~36:

```ts
const paneId: string | undefined = process.env.HERDR_PANE_ID || (slot === null ? undefined : before.pane[slot]);
```

becomes the slot-only form in criterion 1. Keep the surrounding resolution/lookup/swallow logic untouched.

## 5. Do-not, reasons and exceptions

- Do not change the `session` field shape, the panes lookup, or error handling — the swallow rules are deliberate.
- Do not edit tests or `src/AREA.md` (A owns doc lines for this leaf).
- Plan conflict → mismatch, never scope drift. Exception: revised brief from A.

Restated: one expression in `src/log.ts`; nothing else moves.

## 6. Ordered steps

1. Read `src/log.ts`.
2. Apply the criterion-1 edit; update the inline comment if it still describes env-pane use (the comment at ~line 40 says the lookup runs in the resolved session — keep whatever remains true).
3. Run the targeted check, commit.

Size: 1 file, under 6 turns.

## 7. Commands

- `cd /home/ivan/.akrogon/worktrees/akrogon/session-reads-u2 && bun install --frozen-lockfile`
- Targeted: `akrogon run-check --name u2-log -- bun test tests/log-reader.test.ts` (adjacent surface; `tests/session-reads.test.ts` is A's and still partly red — do not run it).

## 8. Done-when, evidence and report

The fallback is gone, the targeted check is green (cite `check u2-log: <exit> <path>`), one commit on the worktree HEAD. Report:

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

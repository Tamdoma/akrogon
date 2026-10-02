# Worker brief 2: observe→log-tail join test (unit 2 of wave 1)

Worktree: /home/ivan/Work/infra/akrogon/issues/worktrees/busy-rule-log-u2

## 1. Goal

Add one join test proving the watch's wiring: real `observe.ts` prints a working seat's log path and real `log-tail.ts` summarizes that file. Plan decisions D5, D6.

## 2. Numbered acceptance criteria

1. New file `skills/watch-issues/scripts/observe-log-tail.test.ts`, self-contained like `log-tail.test.ts` (duplicate the small helpers; do not import from `observe.test.ts` beyond what it already exports).
2. The test: in a temp root, writes one leaf `state.yaml` (slug of choice, `phase: implement`, `repo: testrepo`, `pane.A` set); stubs `akrogon` (prints `repo: testrepo`) and `herdr` (prints an `agent list` JSON with one `working` agent on that pane, `agent: "pi"`, `agent_session: {kind: "path", value: <copied fixture path>}`); copies `fixtures/pi-session.jsonl` to a temp path; runs real `observe.ts` with `OBSERVE_AKROGON`, `OBSERVE_HERDR` and a temp `HOME`; asserts exit 0 and that the printed line's `logA=` equals the copied fixture path; then runs real `log-tail.ts` on that extracted path and asserts exit 0 and the full six expected lines.
3. Expected lines are derived independently of the script: the six pi-session lines exactly as `log-tail.test.ts` asserts them, with `sha256(...).slice(0,8)` computed in-test over the recorded fixture strings — never copied from log-tail output at runtime.
4. A header comment states the test proves observe→log-tail wiring only, not the watch's judgment, and states fixture provenance (copy the provenance comment style from `log-tail.test.ts`).
5. `bun test scripts` and `bun run typecheck` pass inside `skills/watch-issues` (run `bun install` there first, and at the worktree root, before running anything).

## 3. Read-first list

- `skills/watch-issues/scripts/observe.test.ts` — pattern to copy: `runObserve`, `stub`, `akrogonOk`, `herdrOk`, `writeLeaf`, `lines`, temp-HOME handling.
- `skills/watch-issues/scripts/log-tail.test.ts` — `sha8`, `runLogTail`, the pi-session expected-lines block, fixture provenance header.
- `skills/watch-issues/scripts/observe.ts` — `resolveLog`/`formatLeaf`: `path`-kind `agent_session` prints `value` verbatim when the file exists; `log<seat>` prints only for `working` status.
- `skills/watch-issues/scripts/log-tail.ts` — exit/output contract.
- `skills/watch-issues/scripts/fixtures/pi-session.jsonl` — the recorded fixture.
- `/home/ivan/.pi/agent/skills/implement-issue/ponytail.md` — posture.

## 4. Change list and needed interfaces

- Owns: `skills/watch-issues/scripts/observe-log-tail.test.ts` (new file only).
- Interfaces used verbatim: `bun <observe.ts> <root>` prints `slug=<slug> phase=implement attempts=A0,B0 blocked= A=<pane>/working logA=<path> B=-/- notified=`; `bun <log-tail.ts> <path>` prints the six call lines; `pi-session.jsonl` content is `2026-10-02T14:52:01..13` six calls: three `bash false` exit-1, `bash echo done` ok, `read note.txt` ok, `edit note.txt` with `old#`/`new#` over `hello\n`/`bye\n`.
- Shared test resource: none — own temp dirs only; never writes under `fixtures/` (copy it out).
- No prerequisite units.

## 5. Do-not, reasons and exceptions

- Do not edit `observe.ts`, `log-tail.ts`, `observe.test.ts`, `log-tail.test.ts`, fixtures, or `SKILL.md`: owned by other units or already landed; the test consumes their contracts as-is.
- Do not assert on log-tail's judgment (there is none) or on watch behavior: wiring only, per design.
- Do not derive expected lines by running the script: independence is the criterion's core.
- Return a mismatch with evidence to A instead of changing scope; exception is a revised brief from A.
- Restated: one new file only; wiring-only proof; expected lines independent; conflicts come back as a mismatch, not an edit.

## 6. Ordered steps

1. `bun install` at worktree root and in `skills/watch-issues`.
2. Read the four script/test files named above; write the test deriving helpers and expected lines per criteria 2–4.
3. Run `bun test scripts` in `skills/watch-issues` — green including the new test; run `bun run typecheck` there.
4. Commit the new file on the detached HEAD with a conventional message.

Advisory size: 1 file, under 10 turns.

## 7. Commands

`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` with `AKROGON_BASE=bf88de02b3d4541accb6045e9bced3feb45355b4`, run at the worktree root after `bun install` at root and in `skills/watch-issues`. Also paste the `bun test scripts` + `bun run typecheck` results from step 3.

## 8. Done-when, evidence and report

New test file committed, `bun test scripts` and `bun run typecheck` green with output pasted, changed-test command result pasted.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>

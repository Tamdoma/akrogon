# blocked-prompts merged notes (A, B, C)

## Q1 question tool
- Remove `AskUserQuestion` from claude seats (A,B,C). Route differs:
  - (A,B) machine config harness line (~/.akrogon/config.yaml), operator applies exact text (needs row N2); one owner of the recipe.
  - (C) `harnessArgv` (src/seat.ts) appends `--disallowedTools=AskUserQuestion` for kind claude, as it already appends `--session-id` for pi: covered by a repo test, no machine drift, no N2, reaches leaf seats and door-created consultants.
- Pitfall (C): the space form takes a variadic tool list and the task is appended as the next argv element, so `--disallowedTools AskUserQuestion <task>` can swallow the task; the equals form avoids it.
- Free observation (A, 2026-11-16, Claude Code 2.1.325, bogus API key, cost 0): `claude -p --output-format stream-json --verbose --disallowedTools=AskUserQuestion "say hi"` parsed, took "say hi" as the task, and its init tool list (28 tools) had no AskUserQuestion; but the same run without the flag also had none, so headless mode proves nothing about interactive seats. The interactive effect needs one paid probe (N1).

## Q2 blocked seat
- (A,B) Controller only: `observeBusy` (src/next.ts) sends an attention notice at once when a leaf seat is `blocked`, naming repo, slug, seat, kind and msg when present; one per blocked episode, cleared when it leaves blocked; no keys pressed. Gate: (A,C) `noticeState` of id `noticeId(repo,'blocked',slug,slot)`, no new field; (B) a `blocked_notified` field per slot.
- (C) Also press one enter on kind permission for harnesses in a named set starting with agy only (the `agyTask` precedent), with a quiet notice; others get the attention notice.
- Skip the 60-min busy notice while blocked so one episode gives one notice (C).
- Rejected by all: the watch reading and answering screens.

## Q3 chart doors
- (A,C) out of reach, stated limit; the chart account says the door half needs its own report with a door definition first.
- (B) in the report's territory, but no stable door identity exists, so live door automation is fog; no claim of full #135 coverage.
- N11b (an approval row) stays operator-only and is already covered by readiness `inputs` printed by `akrogon status` (A).

## Points where slots differ
Q1 route; Q2 agy release; Q3 limit vs fog.

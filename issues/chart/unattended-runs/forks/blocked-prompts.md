# What happens when a seat stops on a prompt

## Question

Q1. Claude seats call `AskUserQuestion` (found in framework worktree transcripts, 2026-11-15) while pi seats already run without their question tool (`--exclude-tools request_user_input` in the machine harness line). Is the claude question tool removed, and by what route: the machine config harness line (outside the repo, operator-applied exact text) or akrogon code adding it per harness kind?

Q2. Who acts when a leaf seat is `blocked` (hc status, kind permission, question or auth): today `observeBusy` (src/next.ts) treats it like working and sends a quiet notice after 60 minutes. Options include an immediate attention notice from the controller, the controller pressing enter on permission prompts (the agy precedent in `firstTask`), or the watch skill reading and answering.

Q3. Are chart doors (operator-started sessions, not leaves) in this chart's reach?

### Carries

- Signposts 1a (remove the cause first inside existing authority), 2a (outside changes as exact operator-applied text), 3a (no watch answer to a new decision, never past a harness denial), 6a. Hard limits: confirming claimed only where a probe showed the real screen and keys (C L7); every confirmation leaves a durable record (C L3); no forced delivery (B L1).
- Report #135 (INTAKE.md), operator position quoted there.
- Free charting observation (A, 2026-11-16, hc 0.1.21): a throwaway terminal printing `OSC 7501 state=blocked:kind=question:msg=Pick one?` showed in `hc get --json` as `status: {state: blocked, kind: question}` (msg not shown for that value); terminal killed and removed, absence confirmed by `hc ls --all`.

## Findings

Blind notes: slots/blocked-prompts-A.md, -B.md, -C.md; merged: slots/blocked-prompts-merged.md; rebuttals: slots/blocked-prompts-rebuttal-B.md, -C.md.

- Research (better-than-training, src/seat.ts harnessArgv/firstTask/agyTask, src/next.ts observeBusy, src/notice.ts noticeState, src/listen.ts, hc schema Status, `claude --help` 2.1.325, read 2026-11-16).
- Free probes (A, 2026-11-16, hc 0.1.21, Claude Code 2.1.325):
  - A throwaway terminal printing OSC 7501 `state=blocked:kind=permission:msg=Allow?` shows in `hc get --json` as `{kind: permission, state: blocked}` with no msg. The earlier question probe showed the same. So msg cannot be relied on.
  - Headless `claude -p --output-format stream-json --verbose --disallowedTools=AskUserQuestion "say hi"` with a bogus key (cost 0) parsed and took "say hi" as the task (the equals form does not swallow it). Headless lists no AskUserQuestion even without the flag, so it proves nothing about interactive seats.
  - An interactive debug log with a bogus key never names the tool. The interactive effect stays unproven: paid probe under N1.
- `noticeState` reads a missing file as shown, so it cannot gate a first notice (B R1). The code already co-owns seat argv: pi's `--session-id` and the appended task (C R1).

## Taken

A's picks under full autopilot (2026-11-16, door t126), not operator words.

1. Q1: `harnessArgv` (src/seat.ts) appends `--disallowedTools=AskUserQuestion` for kind `claude`, as it appends `--session-id` for pi. The equals form is required so the appended task is not taken as a tool. It reaches leaf seats and door-created consultants, not operator-started sessions. Reason: removal that a repo test covers, the same on every machine, and no outside edit (signposts 1a, 2a; C R1). This changes A's own blind pick. B's dissent (one recipe owner) stands. Needs row N2 is cut as unneeded. The interactive effect needs one paid probe under N1 before handoff.
2. Q2: the controller sends an attention notice at once when a leaf seat's hc status is `blocked`. The title is "Blocked leaf: <repo>/<slug> seat <S> (<kind>)" and the body is the screen tail from `screen()`, since msg is not delivered. A new per-slot field `blocked_notified` (same shape as `busy_notified`) gates one notice per blocked episode, and is cleared with its pending notice removed when the seat leaves blocked. The 60-min busy notice is skipped while blocked. No keys are pressed. Reason: kind names no action or authority, and no real runtime permission screen was observed (signpost 3a, C L7; B R1, R2). C's agy-release dissent stands. The startup `agyTask` handshake is unchanged.
3. Q3: chart doors are out of reach. An operator-started door's harness prompts are the operator's own. Approval rows stay operator-only and are already carried by readiness `inputs` and `akrogon status`. #135's asked-for routine confirmation is not delivered by design (signposts 1a, 3a). So #135 stays open as a partial match with that uncovered part, and is not put in any leaf's `sources`. B's view that this drops handed work is recorded as standing dissent.

Final-shape check (slots/final-check-B.md, slots/final-check-C.md), A's correction 2026-11-16, adopted without a further check because it adds clearing points to the picked field and no new mechanism:

- Q2 corrected (B F2, C D1): `blocked_notified[slot]` is cleared, and its pending notice removed, at three points: a pass that sees the live seat not blocked, the replacement start of that slot's seat in `dispatchSlot`, and every phase move beside `clearBusyNotices` (src/phase.ts). Stated limit (C D1): a seat unblocked by hand and blocked again inside the same turn gets no second notice, because a blocked-to-working change wakes no pass; the field clears at the next turn end.

Free proof of Q1 (A, 2026-11-16, Claude Code 2.1.325, hc 0.1.21, cost 0): two throwaway hc terminals ran interactive `env ANTHROPIC_BASE_URL=http://127.0.0.1:<port> ANTHROPIC_AUTH_TOKEN=probe-token claude --model haiku --effort low --dangerously-skip-permissions [--disallowedTools=AskUserQuestion] "say hi"` from the akrogon root against a local stub (scratchpad probe/fake_api.py) that recorded each POST /v1/messages tool list and answered 401. Result: without the flag every request carried 14 tools including AskUserQuestion; with the flag every request carried 13 and no AskUserQuestion; both sent requests, so the trailing "say hi" was taken as the task, not swallowed as a tool name. Cleanup: both terminals killed and removed, absence confirmed with `hc ls --all`; both stub servers stopped, `pgrep` empty. Limits: proves the interactive tool list the model receives; does not prove the operator's claude.ai login path or a later Claude Code version; the `--model`/`--effort` values are the probe's, not a seat's. This replaces the paid probe planned under N1.

Leaf review (slots/leaf-review-B.md, slots/leaf-review-C.md), 2026-11-16: A adopted every defect into the leaf contracts except moving #137 out of refuse-failed-runs (C S1), which the one-completion-owner rule forbids; the listener PATH crash stays Off route by the reporter's own words.

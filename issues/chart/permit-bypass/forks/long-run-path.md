# Long-run path

## Question
Q1. How does a seat run one check that may wait behind the permit queue and run 12+ minutes, when its harness command limit is 120-600 s?
(Options shaped after guarantee is taken: skill-level background pattern of the whole printed command with an exit file; `akrogon run-check` detached mode; pi shell-timeout sentence change in pi-extensions.)

### Carries
- slots/map-merged.md M2, M4, M7. implement-issue SKILL.md:45 wait-on-exit. queue-order lock.

## Findings
- C: whole printed command in the background, log and exit file under $TMPDIR, wait on the exit file. B: durable run id with start/status/wait/stop. A: detached mode in the unit leaf. C rebuttal R2: detached API delays the unit leaf.

## Taken
Operator 2026-10-13, verbatim "1a, 2a, 3a, 4a, 5a". Round notes slots/ship-{A,B,C}.md, merge slots/ship-merged.md, rebuttals slots/ship-rebuttal-{B,C}.md.
Taken (merge, no B objection to the skill form as interim): skill-level background pattern now, implement-issue SKILL.md:45 names it. Detached run-check mode off route until the run-unit leaf exists and the pattern is seen to fail.

## Proof 2026-10-13: background form across tool calls (Claude Code bash, door seat)
Command: `d=$(mktemp -d "$TMPDIR/run.XXXXXX"); nohup sh -c '<cmd>; echo $? > "$0/exit"' "$d" > "$d/log" 2>&1 & echo $! > "$d/pid"`, read in a later tool call.
Observed: `<cmd>` = `sleep 4; exit 3`: next call found exit=3, PID gone. `<cmd>` = `sleep 60`, wrapper SIGKILLed: no exit file, PID gone (reads as incomplete); the child sleep survived as an orphan and was stopped by its PID.
Cleanup: run dirs removed, orphan stopped by PID.
Limits: Claude Code harness only; pi evidence is the intake's technical-page-inventory nohup run. The orphan child is the case run-units removes.

# Design: guarded-peer-wait

## Binding decisions, verbatim

### Wait mechanism (issues/chart/peer-wait/forks/wait-mechanism.md)
Operator 2026-09-30, verbatim: "1a | 2a | you must test it out yourself if possible. Use slot b consultant, the pane is active to your right"

- Q1 → 1a: prompt with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; on `agent_prompt_stalled` report the peer as not started to the operator, never re-prompt automatically. Reason: herdr's own guard removes the race, matches `src/next.ts:466`. Foreclosed: 1b automatic re-prompt (double prompt risk).
- Q2 → 2a: repeat `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, re-run on code `timeout`; on `blocked` go to the operator; on idle or done read the return file, a missing file is a peer failure to report. Reason: same on every harness. Foreclosed: 2b harness background runner (not portable, caused exit 144), 2c file polling (contradicts the readiness rule).

Correction 2026-09-30, operator "Yes" to B1 and B2 after slot B's final check:
- B1: any non-zero exit of the guarded prompt (`agent_prompt_stalled`, `agent_blocked`, `timeout`) means the peer is not confirmed started; A reports herdr's error to the operator and never re-prompts automatically. Changes the Q1 answer's stall-only wording.
- B2: the bounded repeated wait and `blocked` handling apply before the prompt as well as after it. Changes the Q2 answer's after-prompt-only wording.

Taken wording (chart handoff review, approved 2026-09-30):
> For each named peer, wait until its pane is idle, then prompt it with `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`. Any non-zero exit (`agent_prompt_stalled`, `agent_blocked`, `timeout`) means the peer is not confirmed started: report herdr's error to the operator and never re-prompt it automatically. Every wait on a peer, before and after the prompt, is `herdr agent wait <pane> --timeout <T>` with T below the command timeout the harness gives that call, run again whenever it fails with code `timeout`. A peer that reaches `blocked` goes to the operator. After the prompted turn finishes, read the specified return file and report a missing file as a peer failure.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

This leaf changes one sentence of skill prose. No auth, backend, secret, browser flow or chain stage is touched. The cheapest sufficient proof per criterion is reading the paragraph and the grep in criterion 3; no new test file is added, since a wording-asserting test would be a vanity test. The prompt-and-outside-call rule is met by the live run recorded at charting (herdr 0.9.1, 2026-09-30, `forks/wait-mechanism.md` Operation proof): the guarded prompt reached `working`, five 60000 ms waits returned `timeout` and were re-run, the sixth returned `done` after a 6-minute codex turn, and the return file was complete. The leaf reuses that evidence because the commands it writes are the commands proved; it names the unobserved branches (`agent_prompt_stalled`, prompt `timeout`, `agent_blocked`, `blocked`) as sent to the operator rather than acted on.

## Leaf architecture
Owned: the one sentence in `skills/chart-issues/assets/questions.md`, Blind peer exchange paragraph.
Literal interfaces: `herdr agent prompt <pane> "<text>" --wait --until working --timeout 5000`; `herdr agent wait <pane> --timeout <T>`; herdr error code `timeout` (stderr JSON `{"error":{"code":"timeout",...}}`, exit 1).
Excluded: herdr itself; `src/next.ts` prompt delivery; `skills/watch-issues/SKILL.md` herdr use; any file under `issues/`.
Dependencies: none.

# Design: peer-wait-signal

## Binding decisions, verbatim

### Turn end signal
From [turn-end-signal.md](../../../chart/peer-wait-harness/forks/turn-end-signal.md).
Operator 2026-10-15: `1a | 2a`. `failure` only on an end signal proven for that harness; a kind with no proven signal never fails on idle; after one idle `budget` for such a kind the door stops and asks the operator.
Reason: fast, correct failure for the harnesses in use and no false failure for any other kind; a stuck unproven wait reaches the operator after one budget instead of looping.
Foreclosed: never failing any non-Claude kind on idle (1b); today's 10-second rule for every non-Claude kind (1c); rerunning budgets until the operator steps in (2b); an agy turn reader and an upstream herdr agy fix (Off route).
Final shape 2026-10-16 after the final-shape check by B and C:
1. Turn check per peer from `herdr agent list`: claude transcript unchanged; pi ended on `idle`/`done` only while `agent: pi`, `agent_session.source: herdr:pi` and `screen_detection_skipped` literally `true`, schema `screen_detection_skipped: z.boolean().nullish()`, `source` optional, else unproven (B F1); codex rollout `~/.codex/sessions/*/*/*/rollout-*-<session>.jsonl` (exactly one match), boundary (byte length) recorded before the prompt is sent, bind only a `task_started` written after it, at the first grace check where one is found, hold and retry until then, ended on that id's `task_complete` or `turn_aborted`, else unproven (B F2, C F4); every other kind, agy included, unproven.
2. After the 10 s grace with no file and no `working`: ended → `failure`; open or unproven → keep waiting; deadline → `budget`; `idle` and `done` alike; `agent_status` re-read at each grace check, `blocked` → `blocked` (C F3).
3. Identity re-read at each grace check: kind change error for all; non-null session change error for claude and codex; pi session change ignored while hook authority holds, loss → unproven; null-then-set adopted; agent gone → `No herdr agent on pane` (C F1).
4. Exchange identity (kind, first session, codex boundary, bound turn id) carries across `budget` reruns (B F3); carrying form open for the plan, for example a CLI argument echoed in the outcome line.
5. Outcome line gains `signal: proven|unproven` (B F4, C F2); questions.md: `budget` + `idle`/`done` + `signal: unproven` reported to the operator before any rerun; every other `budget` rerun at once.
6. Tests extend fake herdr and peer-wait fixtures; no machinery leaf.
7. The lesson peer-wait-antigravity-idle is retired by this leaf (lesson rule Retire).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation for this leaf: proven by running `peer-wait.ts` and `peer-ask.ts` as real processes against the existing fake herdr (tests/fake-herdr.ts) with a temporary HOME holding fixture claude transcripts and codex rollout files; never the real `~/.codex` or `~/.claude`. Criterion 1 is the reported bug: its test fails on today's code and passes after. Each other criterion shows one deliberate break turning its test red. Fake herdr gains a per-pane status persisted across `agent wait` and `agent list`, list entries with session `source`, `kind` and `screen_detection_skipped`, and a scripted session change; that is fixture data in the existing fake, not new machinery. Criterion 8's questions.md line and criterion 9 are text; no test for prose. No live model or outside call.

## Leaf architecture

Owned surfaces: `skills/chart-issues/scripts/peer-wait.ts` (list schema, `readPeerAgent`, `turnOpen` replaced by a per-kind open/ended/unproven check, grace loop, `finish` outcome line), `skills/chart-issues/scripts/peer-ask.ts` (records the codex boundary before `herdr agent prompt` and hands it to peer-wait), `skills/chart-issues/assets/questions.md` (budget rule, and the rerun command if its arguments change), `skills/chart-issues/SKILL.md` only where it restates the rerun command, `tests/fake-herdr.ts`, `tests/peer-wait.test.ts`, `tests/peer-ask.test.ts`, `learnings/LESSONS.md` (line removal), `learnings/history/2026-10-15-peer-wait-antigravity-idle.md` (Applied line).

State changed and its consumers:
- Outcome line JSON gains `signal`. Consumers: peer-ask.ts `wait` (reads the child's exit and line), chart-issues door prose in questions.md. Open for the plan: whether any other reader parses the line strictly.
- peer-wait arguments may grow to carry the exchange identity. Consumers: peer-ask.ts spawn, questions.md and SKILL.md rerun command text. Open for the plan: the carrying form.
- The codex boundary is taken in peer-ask before the prompt; a direct `peer-wait.ts` run with no carried boundary treats codex as unproven unless the plan defines another safe source.
- Today `turnOpen` returns false for every non-claude kind and the grace path gives `failure` (peer-wait.ts `turnOpen`, `main`); that path changes for pi, codex and every other kind.

Exclusions: an agy turn reader; herdr changes; claude transcript logic.

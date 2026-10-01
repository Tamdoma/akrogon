# Design: seat-exit-rules

## Binding decisions, verbatim

### red-criterion Q2 (issues/chart/leaf-run-stalls/forks/red-criterion.md)
Operator 2026-10-01, verbatim: "1 - elid, I dont understand at all | 2a - but how will this work? | 3 - just communicate the exact fir to the watch-framework tab over there. It can stop the current leaf, do the fixes and restart it. Just tell it through herdr what to do and how to test it fast."
Q2 2a: during implement or check.fix, a criterion that still fails and cannot pass within the leaf's owned surfaces ends the pass `akrogon phase <slug> failed --reason "<criterion> red: <cause>"`. It is never handed off as pre-existing. This reuses implement-issue/SKILL.md:31-32 and the existing failed announcement (src/phase.ts:57,75). Foreclosed: 2b, a command-owned proof gate in `src/phase.ts`.
Observed 2026-10-01 07:07: framework round 2 ran `framework:verify`, found a new red on main and ended the pass `failed` under this rule, and the stop held.

### provider-death (issues/chart/leaf-run-stalls/forks/provider-death.md)
Operator 2026-10-01, verbatim: "1 - 10 minutes, most. I can't let it stay idle for an hour. Is there a mechanism that is simple enough to recognize this is an actual provider issue instead of something else? | 2a | 3a | 4a".
Q1: pi retry budget of at most about 10 minutes in `~/.pi/agent/settings.json`. This is an operator step done at handoff, not this leaf. Recognition is the existing mechanism: pi retries only errors matching its provider pattern (overloaded, 429/500/502/503/504, rate limit, service unavailable, network and stream drops) and never quota, billing or context overflow (pi-ai/dist/utils/retry.js:4-78, agent-session.js:2248-2253). The counter resets after every successful reply (agent-session.js:408-416). A reads the same error text from the failed result (tamdoma-subagents/completion.ts:200-205).
Q2 2a with safeguards: same worktree, original brief plus the fixed line (check what is already done, including commits, files and external effects; keep what is correct; finish the brief), after the old worker has ended. worker-protocol.md:17 changes for provider deaths only. Foreclosed: 2b pi-extensions resume tool (off route, new intake if a provider death recurs after the retry raise and the rerun costs over an hour).
Q3 3a: no step commits.
Q4 4a: a second provider death of the same unit ends the pass `failed`, naming the provider, the error and both transcripts. Seat deaths do not count.

### Excluded binding decisions
- red-criterion Q1 and leaf-split belong to chart-audit-rules. failed-stop-race belongs to failed-stop-guard.
- provider-death Q1 settings are an operator step. Q3 writes no text.

## Standing design

/home/ivan/Work/infra/akrogon/skills/chart-issues/assets/standing-design.md

This leaf changes skill prose only. No auth, backend, secret, browser flow or chain stage is involved. The cheapest sufficient proof is reading the changed sentences against criteria 1-2. A wording test would be a vanity test. The outside operation the rule names (spawn a subagent with cwd set to a retained same-repo worktree, and the failed result carrying the provider error) was run for real at charting: slots/probe-pi-retry.md, cases V2 and V3. The leaf reuses that evidence because the spawn and result it describes are the ones proved.

## Leaf architecture
Owned: `skills/implement-issue/SKILL.md` (the failed-exit paragraph at lines 31-32 and the check.fix section), `skills/implement-issue/worker-protocol.md` (the sentence at line 17).
Literal interfaces: `akrogon phase <slug> failed --reason "<criterion> red: <cause>" --slot A`. The added worker line, verbatim: "A previous worker died here. Check what is already done (criteria, commits, changed files and external effects such as uploads) before repeating work. Keep what is correct. Finish the brief."
Excluded: pi settings, tamdoma-subagents code, `skills/check-issue`, `skills/chart-issues`, `src/`, any file under `issues/`.
Dependencies: none.
